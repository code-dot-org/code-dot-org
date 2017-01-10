package org.cobbzilla.s3s3mirror;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
public class MirrorContext {

    @Getter @Setter private MirrorOptions options;
    @Getter private final MirrorStats stats = new MirrorStats();

}
