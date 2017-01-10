package org.cobbzilla.s3s3mirror;

import lombok.AllArgsConstructor;
import lombok.ToString;

@AllArgsConstructor @ToString
class S3Asset {
    public String bucket;
    public String key;
}
