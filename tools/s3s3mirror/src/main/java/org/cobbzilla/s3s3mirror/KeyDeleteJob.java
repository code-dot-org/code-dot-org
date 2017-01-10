package org.cobbzilla.s3s3mirror;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.*;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;

@Slf4j
public class KeyDeleteJob extends KeyJob {

    private String keysrc;

    public KeyDeleteJob (AmazonS3Client client, MirrorContext context, S3ObjectSummary summary, Object notifyLock) {
        super(client, context, summary, notifyLock);

        final MirrorOptions options = context.getOptions();
        keysrc = summary.getKey(); // NOTE: summary.getKey is the key in the destination bucket
        if (options.hasPrefix()) {
            keysrc = keysrc.substring(options.getDestPrefixLength());
            keysrc = options.getPrefix() + keysrc;
        }
    }

    @Override public Logger getLog() { return log; }

    @Override
    public void run() {
        final MirrorOptions options = context.getOptions();
        final MirrorStats stats = context.getStats();
        final boolean verbose = options.isVerbose();
        final int maxRetries = options.getMaxRetries();
        final String key = summary.getKey();
        try {
            if (!shouldDelete()) return;

            final DeleteObjectRequest request = new DeleteObjectRequest(options.getDestinationBucket(), key);

            if (options.isDryRun()) {
                log.info("Would have deleted "+key+" from destination because "+keysrc+" does not exist in source");
            } else {
                boolean deletedOK = false;
                for (int tries=0; tries<maxRetries; tries++) {
                    if (verbose) log.info("deleting (try #"+tries+"): "+key);
                    try {
                        stats.s3deleteCount.incrementAndGet();
                        client.deleteObject(request);
                        deletedOK = true;
                        if (verbose) log.info("successfully deleted (on try #"+tries+"): "+key);
                        break;

                    } catch (AmazonS3Exception s3e) {
                        log.error("s3 exception deleting (try #"+tries+") "+key+": "+s3e);

                    } catch (Exception e) {
                        log.error("unexpected exception deleting (try #"+tries+") "+key+": "+e);
                    }
                    try {
                        Thread.sleep(10);
                    } catch (InterruptedException e) {
                        log.error("interrupted while waiting to retry key: "+key);
                        break;
                    }
                }
                if (deletedOK) {
                    context.getStats().objectsDeleted.incrementAndGet();
                } else {
                    context.getStats().deleteErrors.incrementAndGet();
                }
            }

        } catch (Exception e) {
            log.error("error deleting key: "+key+": "+e);

        } finally {
            synchronized (notifyLock) {
                notifyLock.notifyAll();
            }
            if (verbose) log.info("done with "+key);
        }
    }

    private boolean shouldDelete() {

        final MirrorOptions options = context.getOptions();
        final boolean verbose = options.isVerbose();

        // Does it exist in the source bucket
        try {
            ObjectMetadata metadata = getObjectMetadata(options.getSourceBucket(), keysrc, options);
            return false; // object exists in source bucket, don't delete it from destination bucket

        } catch (AmazonS3Exception e) {
            if (e.getStatusCode() == 404) {
                if (verbose) log.info("Key not found in source bucket (will delete from destination): "+ keysrc);
                return true;
            } else {
                log.warn("Error getting metadata for " + options.getSourceBucket() + "/" + keysrc + " (not deleting): " + e);
                return false;
            }
        } catch (Exception e) {
            log.warn("Error getting metadata for " + options.getSourceBucket() + "/" + keysrc + " (not deleting): " + e);
            return false;
        }
    }

}
