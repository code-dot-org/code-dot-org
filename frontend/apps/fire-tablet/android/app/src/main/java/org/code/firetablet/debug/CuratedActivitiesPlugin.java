package org.code.firetablet.debug;

import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONException;

@CapacitorPlugin(name = "CuratedActivities")
public class CuratedActivitiesPlugin extends Plugin {
    @PluginMethod
    public void open(PluginCall call) {
        try {
            List<String> paths = call.getArray("allowedPaths").toList();
            String url = call.getString("url");
            if (!new NavigationPolicy(paths).allows(url)) {
                call.reject("Activity URL is not allowed.");
                return;
            }
            Intent intent = new Intent(getContext(), CuratedActivity.class);
            intent.putExtra("url", url);
            intent.putExtra("title", call.getString("title"));
            intent.putStringArrayListExtra("allowedPaths", new ArrayList<>(paths));
            startActivityForResult(call, intent, "activityClosed");
        } catch (JSONException | NullPointerException exception) {
            call.reject("An activity URL and navigation policy are required.");
        }
    }

    @ActivityCallback
    private void activityClosed(PluginCall call, ActivityResult result) {
        if (call != null) call.resolve();
    }
}
