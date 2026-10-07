package org.code.firetablet.debug;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import java.io.ByteArrayInputStream;
import java.util.Collections;
import java.util.List;

public class CuratedActivity extends AppCompatActivity {
    private static boolean webViewConfigured;
    private WebView webView;
    private TextView status;
    private NavigationPolicy policy;
    private String initialUrl;
    private boolean pageFailed;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // This activity runs in its own process, separate from the Capacitor bridge.
        if (!webViewConfigured) {
            WebView.setDataDirectorySuffix("curated-activities");
            webViewConfigured = true;
        }
        super.onCreate(savedInstanceState);
        List<String> paths = getIntent().getStringArrayListExtra("allowedPaths");
        if (paths == null) { finish(); return; }
        policy = new NavigationPolicy(paths);
        initialUrl = getIntent().getStringExtra("url");
        if (!policy.allows(initialUrl)) { finish(); return; }

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        ViewCompat.setOnApplyWindowInsetsListener(layout, (view, insets) -> {
            var bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
        });
        LinearLayout toolbar = new LinearLayout(this);
        Button home = new Button(this);
        home.setText("Home");
        home.setOnClickListener(view -> finish());
        toolbar.addView(home);
        TextView title = new TextView(this);
        title.setText(getIntent().getStringExtra("title"));
        title.setGravity(android.view.Gravity.CENTER_VERTICAL);
        toolbar.addView(title, new LinearLayout.LayoutParams(0, -1, 1));
        Button retry = new Button(this);
        retry.setText("Retry");
        retry.setOnClickListener(view -> loadActivity());
        toolbar.addView(retry);
        layout.addView(toolbar);
        status = new TextView(this);
        status.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);
        layout.addView(status);
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean dialog, boolean gesture, Message result) {
                blocked();
                return false;
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) { request.deny(); }
        });
        webView.setDownloadListener((url, agent, disposition, type, length) -> blocked());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String address = request.getUrl().toString();
                if (policy.allows(address) || (!request.isForMainFrame() && policy.allowsMediaFrame(address))) return false;
                blocked();
                return true;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                // POST and app-initiated loads do not pass through shouldOverrideUrlLoading.
                if (request.isForMainFrame() && !policy.allows(request.getUrl().toString())) {
                    runOnUiThread(() -> blocked());
                    return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden",
                        Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
                }
                return null;
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                if (!policy.allows(url)) { view.stopLoading(); blocked(); return; }
                pageFailed = false;
                status.setText("Loading activity…");
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (!pageFailed && policy.allows(url)) status.setText("");
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) loadFailed();
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame()) loadFailed();
            }
        });
        layout.addView(webView, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(layout);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack(); else finish();
            }
        });
        loadActivity();
    }

    private void loadActivity() {
        if (policy.allows(initialUrl)) webView.loadUrl(initialUrl);
    }

    private void blocked() { status.setText("That page is outside this activity. You can keep playing or return Home."); }

    private void loadFailed() {
        pageFailed = true;
        status.setText("Could not load. Check your connection and tap Retry, or return Home.");
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) { webView.stopLoading(); webView.destroy(); }
        super.onDestroy();
    }
}
