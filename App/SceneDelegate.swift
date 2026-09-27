import UIKit
import AVFoundation
import WebKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = GameViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        (UIApplication.shared.delegate as? AppDelegate)?.activateAudioSession()
    }

    func sceneWillResignActive(_ scene: UIScene) {
        guard let gameViewController = window?.rootViewController as? GameViewController else { return }
        gameViewController.pauseGame()
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

private final class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
    private weak var delegate: WKScriptMessageHandler?

    init(delegate: WKScriptMessageHandler) {
        self.delegate = delegate
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        delegate?.userContentController(userContentController, didReceive: message)
    }
}

class GameViewController: CAPBridgeViewController, WKScriptMessageHandler {
    private let gameAudio = GameAudioPlayer()
    override var prefersStatusBarHidden: Bool { true }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .landscape }

    override func viewDidLoad() {
        super.viewDidLoad()
        webView?.scrollView.isScrollEnabled = false
        webView?.scrollView.bounces = false
        webView?.configuration.userContentController.add(WeakScriptMessageHandler(delegate: self), name: "audioSession")
        gameAudio.preload()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        (UIApplication.shared.delegate as? AppDelegate)?.activateAudioSession()
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "audioSession",
              let command = message.body as? [String: Any],
              let action = command["action"] as? String else { return }
        if action == "configure" {
            (UIApplication.shared.delegate as? AppDelegate)?.activateAudioSession()
        } else if action == "resume" || action == "playMusic" {
            (UIApplication.shared.delegate as? AppDelegate)?.activateAudioSession()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) { [weak self] in
                self?.gameAudio.handle(command)
            }
            return
        }
        gameAudio.handle(command)
    }

    func pauseGame() {
        webView?.evaluateJavaScript("document.dispatchEvent(new Event('hood-runner-background')); document.dispatchEvent(new Event('hood-runner-pause'))")
    }
}

private final class AudioCommand: @unchecked Sendable {
    let values: [String: Any]

    init(_ values: [String: Any]) {
        self.values = values
    }
}

private final class GameAudioPlayer: @unchecked Sendable {
    private let audioQueue = DispatchQueue(label: "fun.robintheface.marketrunner.game-audio", qos: .userInitiated)
    private var musicPlayer: AVAudioPlayer?
    private var currentMusicFile: String?
    private var runPlayer: AVAudioPlayer?
    private var effectPlayers: [AVAudioPlayer] = []
    private var audioData: [String: Data] = [:]
    private var musicVolume: Float = 0.5
    private var sfxVolume: Float = 0.35
    private var isMuted = false
    private var musicWasPlayingBeforePause = false
    private var runWasPlayingBeforePause = false

    func preload() {
        audioQueue.async { [self] in
            let files = [
                "1sound.mp3", "2sound.mp3", "3sound.mp3", "5sound.mp3",
                "main-1.mp3", "main-2.mp3", "main-3.mp3", "main-4.mp3", "main-5.mp3",
                "bonus-time.mp3", "bonus-1.mp3", "bonus-2.mp3", "bonus-3.mp3", "bonus-4.mp3", "bonus-5.mp3", "bonus-6.mp3",
                "jumping.mp3", "landing.mp3", "coin.mp3", "impact.mp3", "running.mp3", "levelup.mp3"
            ]
            for file in files {
                guard let url = audioURL(for: file), let data = try? Data(contentsOf: url) else { continue }
                audioData[file] = data
            }
        }
    }

    func handle(_ command: [String: Any]) {
        let command = AudioCommand(command)
        audioQueue.async { [self] in
            process(command.values)
        }
    }

    private func process(_ command: [String: Any]) {
        guard let action = command["action"] as? String else { return }

        switch action {
        case "configure":
            updateVolumes(command)
        case "playMusic":
            updateVolumes(command)
            musicPlayer?.stop()
            currentMusicFile = command["file"] as? String
            musicPlayer = makePlayer(file: currentMusicFile, loops: -1, volume: 0)
            musicPlayer?.play()
            let fadeDuration = (command["fadeDuration"] as? NSNumber)?.doubleValue ?? 3
            musicPlayer?.setVolume(effectiveMusicVolume, fadeDuration: fadeDuration)
        case "stopMusic":
            musicPlayer?.stop()
            musicPlayer = nil
            currentMusicFile = nil
        case "playSfx":
            updateVolumes(command)
            effectPlayers.removeAll { !$0.isPlaying }
            guard let player = makePlayer(file: command["file"] as? String, loops: 0, volume: sfxVolume) else { return }
            effectPlayers.append(player)
            player.play()
        case "startRun":
            updateVolumes(command)
            guard runPlayer == nil else { return }
            runPlayer = makePlayer(file: command["file"] as? String, loops: -1, volume: sfxVolume)
            runPlayer?.play()
        case "stopRun":
            runPlayer?.stop()
            runPlayer = nil
        case "setMusicVolume":
            updateVolumes(command)
            musicPlayer?.volume = effectiveMusicVolume
        case "setSfxVolume":
            updateVolumes(command)
            runPlayer?.volume = effectiveSfxVolume
        case "setMuted":
            updateVolumes(command)
            musicPlayer?.volume = effectiveMusicVolume
            runPlayer?.volume = effectiveSfxVolume
        case "pause":
            musicWasPlayingBeforePause = musicPlayer?.isPlaying == true
            runWasPlayingBeforePause = runPlayer?.isPlaying == true
            musicPlayer?.pause()
            runPlayer?.pause()
            effectPlayers.forEach { $0.stop() }
            effectPlayers.removeAll()
        case "resume":
            if !isMuted {
                if command["shouldPlayMusic"] as? Bool == true, musicPlayer == nil {
                    musicPlayer = makePlayer(file: currentMusicFile, loops: -1, volume: effectiveMusicVolume)
                }
                if musicWasPlayingBeforePause || command["shouldPlayMusic"] as? Bool == true { musicPlayer?.play() }
                if runWasPlayingBeforePause, command["run"] as? Bool == true { runPlayer?.play() }
            }
            musicWasPlayingBeforePause = false
            runWasPlayingBeforePause = false
        default:
            break
        }
    }

    private var effectiveMusicVolume: Float { isMuted ? 0 : musicVolume }
    private var effectiveSfxVolume: Float { isMuted ? 0 : sfxVolume }

    private func updateVolumes(_ command: [String: Any]) {
        if let value = command["music"] as? NSNumber { musicVolume = value.floatValue }
        if let value = command["sfx"] as? NSNumber { sfxVolume = value.floatValue }
        if let value = command["muted"] as? Bool { isMuted = value }
    }

    private func makePlayer(file: String?, loops: Int, volume: Float) -> AVAudioPlayer? {
        guard let file else {
            print("Candle Rush: native audio file not found: nil")
            return nil
        }

        do {
            let data: Data
            if let cached = audioData[file] {
                data = cached
            } else if let url = audioURL(for: file) {
                data = try Data(contentsOf: url)
                audioData[file] = data
            } else {
                print("Candle Rush: native audio file not found: \(file)")
                return nil
            }
            let player = try AVAudioPlayer(data: data)
            player.numberOfLoops = loops
            player.volume = isMuted ? 0 : volume
            player.prepareToPlay()
            return player
        } catch {
            print("Candle Rush: native audio load failed for \(file): \(error)")
            return nil
        }
    }

    private func audioURL(for file: String) -> URL? {
        let directories = ["public/game/sound-effects", "game/sound-effects"]
        for directory in directories {
            if let url = Bundle.main.url(forResource: file, withExtension: nil, subdirectory: directory) {
                return url
            }
        }
        return nil
    }
}
