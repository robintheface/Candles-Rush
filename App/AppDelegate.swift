import UIKit
import AVFoundation
import MediaPlayer
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var isAudioSessionConfigured = false

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        application.endReceivingRemoteControlEvents()
        let commands = MPRemoteCommandCenter.shared()
        commands.playCommand.isEnabled = false
        commands.pauseCommand.isEnabled = false
        commands.togglePlayPauseCommand.isEnabled = false
        activateAudioSession()
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        activateAudioSession()
    }

    func activateAudioSession() {
        let audioSession = AVAudioSession.sharedInstance()

        do {
            if !isAudioSessionConfigured {
                try audioSession.setCategory(.playback, mode: .default, options: [])
                isAudioSessionConfigured = true
            }

            if #available(iOS 27.0, *) {
                audioSession.activate { success, error in
                    guard !success, let error else { return }
                    print("Candle Rush: failed to activate audio session: \(error)")
                }
            } else {
                try audioSession.setActive(true)
            }
        } catch {
            print("Candle Rush: failed to configure audio session: \(error)")
        }
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
