package org.code.firetablet.debug;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import java.util.List;
import org.junit.Test;

public class NavigationPolicyTest {
    private final NavigationPolicy policy = new NavigationPolicy(List.of("/s/oceans", "/courses/oceans"));

    @Test
    public void allowsCourseLevelsAndCanonicalRedirects() {
        assertTrue(policy.allows("https://studio.code.org/s/oceans"));
        assertTrue(policy.allows("https://studio.code.org/courses/oceans/units/1/lessons/1/levels/2?foo=bar#main"));
        assertTrue(policy.allows("https://studio.code.org:443/s/oceans/lessons/1/levels/1"));
    }

    @Test
    public void blocksWebsiteAccountsOtherActivitiesAndExternalDestinations() {
        for (String url : List.of(
            "https://studio.code.org/", "https://studio.code.org/users/sign_in",
            "https://studio.code.org/s/oceans-other", "https://studio.code.org/s/mc",
            "https://code.org/about", "https://code.org/donate", "https://studio.code.org.evil.test/s/oceans",
            "https://evil.test@studio.code.org/s/oceans", "http://studio.code.org/s/oceans",
            "https://studio.code.org:8443/s/oceans", "intent://studio.code.org/s/oceans",
            "javascript:alert(1)", "https://studio.code.org/s/oceans/../mc",
            "https://studio.code.org/s/oceans/%2e%2e/mc", "https://studio.code.org/s/oceans%2f..%2fmc",
            "https://studio.code.org/s/oceans\\..\\mc"
        )) assertFalse(url, policy.allows(url));
    }

    @Test
    public void allowsGeneratedMusicProjectIdsWithoutAllowingOtherLabs() {
        NavigationPolicy music = new NavigationPolicy(List.of("/projects/music"));
        assertTrue(music.allows("https://studio.code.org/projects/music/new"));
        assertTrue(music.allows("https://studio.code.org/projects/music/9a46bc72-76c6-4f5f-a359-eb2fb76dd04f/view"));
        assertFalse(music.allows("https://studio.code.org/projects/music-other/new"));
        assertFalse(music.allows("https://studio.code.org/projects/applab/new"));
    }

    @Test
    public void allowsOnlyVideoEmbedPathsAsMediaFrames() {
        assertTrue(policy.allowsMediaFrame("https://www.youtube-nocookie.com/embed/example?rel=0"));
        assertTrue(policy.allowsMediaFrame("https://www.youtube.com/embed/example"));
        assertFalse(policy.allows("https://www.youtube-nocookie.com/embed/example"));
        assertFalse(policy.allowsMediaFrame("https://www.youtube.com/watch?v=example"));
        assertFalse(policy.allowsMediaFrame("https://www.youtube.com/embed/../watch"));
        assertFalse(policy.allowsMediaFrame("https://evil.test/embed/example"));
    }
}
