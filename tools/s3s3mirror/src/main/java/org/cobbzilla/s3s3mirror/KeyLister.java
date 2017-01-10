package org.cobbzilla.s3s3mirror;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.ListObjectsRequest;
import com.amazonaws.services.s3.model.ObjectListing;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
public class KeyLister implements Runnable {

    private AmazonS3Client client;
    private MirrorContext context;
    private int maxQueueCapacity;

    private final List<S3ObjectSummary> summaries;
    private final AtomicBoolean done = new AtomicBoolean(false);
    private ObjectListing listing;

    public boolean isDone () { return done.get(); }

    public KeyLister(AmazonS3Client client, MirrorContext context, int maxQueueCapacity, String bucket, String prefix) {
        this.client = client;
        this.context = context;
        this.maxQueueCapacity = maxQueueCapacity;

        final MirrorOptions options = context.getOptions();
        int fetchSize = options.getMaxThreads();
        this.summaries = new ArrayList<S3ObjectSummary>(10*fetchSize);

        final ListObjectsRequest request = new ListObjectsRequest(bucket, prefix, null, null, fetchSize);
        listing = s3getFirstBatch(client, request);
        synchronized (summaries) {
            final List<S3ObjectSummary> objectSummaries = listing.getObjectSummaries();
            summaries.addAll(objectSummaries);
            context.getStats().objectsRead.addAndGet(objectSummaries.size());
            if (options.isVerbose()) log.info("added initial set of "+objectSummaries.size()+" keys");
        }
    }

    @Override
    public void run() {
        final MirrorOptions options = context.getOptions();
        final boolean verbose = options.isVerbose();
        int counter = 0;
        log.info("starting...");
        try {
            while (true) {
                while (getSize() < maxQueueCapacity) {
                    if (listing.isTruncated()) {
                        listing = s3getNextBatch();
                        if (++counter % 100 == 0) context.getStats().logStats();
                        synchronized (summaries) {
                            final List<S3ObjectSummary> objectSummaries = listing.getObjectSummaries();
                            summaries.addAll(objectSummaries);
                            context.getStats().objectsRead.addAndGet(objectSummaries.size());
                            if (verbose) log.info("queued next set of "+objectSummaries.size()+" keys (total now="+getSize()+")");
                        }

                    } else {
                        log.info("No more keys found in source bucket, exiting");
                        return;
                    }
                }
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    log.error("interrupted!");
                    return;
                }
            }
        } catch (Exception e) {
            log.error("Error in run loop, KeyLister thread now exiting: "+e);

        } finally {
            if (verbose) log.info("KeyLister run loop finished");
            done.set(true);
        }
    }

    private ObjectListing s3getFirstBatch(AmazonS3Client client, ListObjectsRequest request) {

        final MirrorOptions options = context.getOptions();
        final boolean verbose = options.isVerbose();
        final int maxRetries = options.getMaxRetries();

        Exception lastException = null;
        for (int tries=0; tries<maxRetries; tries++) {
            try {
                context.getStats().s3getCount.incrementAndGet();
                ObjectListing listing = client.listObjects(request);
                if (verbose) log.info("successfully got first batch of objects (on try #"+tries+")");
                return listing;

            } catch (Exception e) {
                lastException = e;
                log.warn("s3getFirstBatch: error listing (try #"+tries+"): "+e);
                if (Sleep.sleep(50)) {
                    log.info("s3getFirstBatch: interrupted while waiting for next try");
                    break;
                }
            }
        }
        throw new IllegalStateException("s3getFirstBatch: error listing: "+lastException, lastException);
    }

    private ObjectListing s3getNextBatch() {
        final MirrorOptions options = context.getOptions();
        final boolean verbose = options.isVerbose();
        final int maxRetries = options.getMaxRetries();

        for (int tries=0; tries<maxRetries; tries++) {
            try {
                context.getStats().s3getCount.incrementAndGet();
                ObjectListing next = client.listNextBatchOfObjects(listing);
                if (verbose) log.info("successfully got next batch of objects (on try #"+tries+")");
                return next;

            } catch (AmazonS3Exception s3e) {
                log.error("s3 exception listing objects (try #"+tries+"): "+s3e);

            } catch (Exception e) {
                log.error("unexpected exception listing objects (try #"+tries+"): "+e);
            }
            if (Sleep.sleep(50)) {
                log.info("s3getNextBatch: interrupted while waiting for next try");
                break;
            }
        }
        throw new IllegalStateException("Too many errors trying to list objects (maxRetries="+maxRetries+")");
    }

    private int getSize() {
        synchronized (summaries) {
            return summaries.size();
        }
    }

    public List<S3ObjectSummary> getNextBatch() {
        List<S3ObjectSummary> copy;
        synchronized (summaries) {
            copy = new ArrayList<S3ObjectSummary>(summaries);
            summaries.clear();
        }
        return copy;
    }
}