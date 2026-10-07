import Capacitor
import UIKit
import WebKit

class StudioBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(CuratedActivitiesPlugin())
    }
}

struct NavigationPolicy {
    let allowedPaths: [String]

    func allows(_ url: URL?) -> Bool {
        guard let url, let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              components.scheme?.lowercased() == "https",
              components.host?.lowercased() == "studio.code.org",
              components.user == nil, components.password == nil,
              components.port == nil || components.port == 443 else { return false }
        let path = components.percentEncodedPath
        guard path.range(of: "^/[A-Za-z0-9/_-]*$", options: .regularExpression) != nil else { return false }
        return allowedPaths.contains { path == $0 || path.hasPrefix($0 + "/") }
    }

    func allowsMediaFrame(_ url: URL?) -> Bool {
        guard let url, let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              components.scheme == "https", components.user == nil, components.password == nil,
              components.port == nil || components.port == 443 else { return false }
        let path = components.percentEncodedPath
        guard path.range(of: "^/[A-Za-z0-9/_-]*$", options: .regularExpression) != nil else { return false }
        return ["www.youtube.com", "www.youtube-nocookie.com"].contains(components.host ?? "") && path.hasPrefix("/embed/")
    }
}

@objc(CuratedActivitiesPlugin)
public class CuratedActivitiesPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CuratedActivitiesPlugin"
    public let jsName = "CuratedActivities"
    public let pluginMethods = [CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise)]

    @objc func open(_ call: CAPPluginCall) {
        guard let address = call.getString("url"), let url = URL(string: address),
              let paths = call.getArray("allowedPaths", String.self),
              NavigationPolicy(allowedPaths: paths).allows(url) else {
            call.reject("Activity URL is not allowed.")
            return
        }
        DispatchQueue.main.async {
            guard let presenter = self.bridge?.viewController, presenter.presentedViewController == nil else {
                call.reject("An activity view is already open or unavailable.")
                return
            }
            let activity = CuratedActivityViewController(
                url: url, title: call.getString("title") ?? "Activity",
                policy: NavigationPolicy(allowedPaths: paths), onClose: { call.resolve() }
            )
            let navigation = UINavigationController(rootViewController: activity)
            navigation.modalPresentationStyle = .fullScreen
            presenter.present(navigation, animated: true)
        }
    }
}

private class CuratedActivityViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    private let initialURL: URL
    private let policy: NavigationPolicy
    private let onClose: () -> Void
    private let status = UILabel()
    private var webView: WKWebView!

    init(url: URL, title: String, policy: NavigationPolicy, onClose: @escaping () -> Void) {
        initialURL = url
        self.policy = policy
        self.onClose = onClose
        super.init(nibName: nil, bundle: nil)
        self.title = title
    }

    required init?(coder: NSCoder) { fatalError("Use the activity initializer") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Home", style: .plain, target: self, action: #selector(close))
        navigationItem.rightBarButtonItems = [
            UIBarButtonItem(title: "Retry", style: .plain, target: self, action: #selector(retry)),
            UIBarButtonItem(title: "Back", style: .plain, target: self, action: #selector(back))
        ]
        status.font = .preferredFont(forTextStyle: .footnote)
        status.adjustsFontForContentSizeCategory = true
        status.numberOfLines = 0
        status.translatesAutoresizingMaskIntoConstraints = false
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = .all
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(status)
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            status.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 4),
            status.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 16),
            status.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            webView.topAnchor.constraint(equalTo: status.bottomAnchor, constant: 4),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
        retry()
    }

    @objc private func close() {
        webView.stopLoading()
        dismiss(animated: true, completion: onClose)
    }

    @objc private func back() {
        if webView.canGoBack { webView.goBack() } else { close() }
    }

    @objc private func retry() {
        if policy.allows(initialURL) { webView.load(URLRequest(url: initialURL)) }
    }

    private func blocked() {
        status.text = "That page is outside this activity. You can keep playing or return Home."
        UIAccessibility.post(notification: .announcement, argument: status.text)
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let mediaFrame = action.targetFrame?.isMainFrame == false && policy.allowsMediaFrame(action.request.url)
        guard action.targetFrame != nil, policy.allows(action.request.url) || mediaFrame else {
            blocked()
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, decidePolicyFor response: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if response.isForMainFrame && (!policy.allows(response.response.url) || !response.canShowMIMEType) {
            blocked()
            decisionHandler(.cancel)
        } else {
            decisionHandler(.allow)
        }
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        blocked()
        return nil
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        status.text = "Loading activity…"
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        status.text = ""
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if (error as NSError).code != NSURLErrorCancelled {
            status.text = "Could not load. Check your connection and tap Retry, or return Home."
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        status.text = "Could not load. Check your connection and tap Retry, or return Home."
    }
}
