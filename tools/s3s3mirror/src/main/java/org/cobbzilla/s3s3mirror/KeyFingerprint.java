package org.cobbzilla.s3s3mirror;

import lombok.*;

@EqualsAndHashCode(callSuper=false) @AllArgsConstructor
public class KeyFingerprint {

    @Getter private final long size;
    @Getter private final String etag;
   
    public KeyFingerprint(long size) {
        this(size, null);
    }

}
