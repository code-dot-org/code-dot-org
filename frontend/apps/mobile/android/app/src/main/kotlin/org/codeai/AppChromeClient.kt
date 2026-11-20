package org.codeai

import android.net.Uri
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebView
import com.getcapacitor.Bridge
import com.getcapacitor.BridgeWebChromeClient

/**
 * Amazon Kids+ allows no camera, microphone or location access, and no file
 * picker, which would leave the app.
 */
internal class AppChromeClient(bridge: Bridge) : BridgeWebChromeClient(bridge) {
    override fun onPermissionRequest(request: PermissionRequest) = request.deny()

    override fun onGeolocationPermissionsShowPrompt(
        origin: String,
        callback: GeolocationPermissions.Callback,
    ) = callback.invoke(origin, false, false)

    override fun onShowFileChooser(
        webView: WebView,
        filePathCallback: ValueCallback<Array<Uri>>,
        fileChooserParams: FileChooserParams,
    ): Boolean {
        filePathCallback.onReceiveValue(null)
        return true
    }
}
