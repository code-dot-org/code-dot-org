package org.code.firetablet.debug;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

final class NavigationPolicy {
    private final List<String> allowedPaths;

    NavigationPolicy(List<String> allowedPaths) {
        this.allowedPaths = allowedPaths;
    }

    boolean allows(String address) {
        if (address == null) return false;
        try {
            URI url = new URI(address);
            String path = url.getRawPath();
            if (!"https".equalsIgnoreCase(url.getScheme()) ||
                !"studio.code.org".equalsIgnoreCase(url.getHost()) ||
                url.getRawUserInfo() != null ||
                (url.getPort() != -1 && url.getPort() != 443) ||
                path == null || !path.matches("/[A-Za-z0-9/_-]*")) return false;
            return allowedPaths.stream().anyMatch(prefix ->
                path.equals(prefix) || path.startsWith(prefix + "/")
            );
        } catch (URISyntaxException exception) {
            return false;
        }
    }

    boolean allowsMediaFrame(String address) {
        try {
            URI url = new URI(address);
            if (!"https".equals(url.getScheme()) || url.getRawUserInfo() != null ||
                (url.getPort() != -1 && url.getPort() != 443)) return false;
            String path = url.getRawPath();
            return path != null && path.matches("/[A-Za-z0-9/_-]*") &&
                ("www.youtube.com".equals(url.getHost()) || "www.youtube-nocookie.com".equals(url.getHost())) && path.startsWith("/embed/");
        } catch (URISyntaxException exception) {
            return false;
        }
    }
}
