package org.code.firetablet.debug;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CuratedActivitiesPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
