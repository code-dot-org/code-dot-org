package org.cobbzilla.s3s3mirror;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.S3ObjectSummary;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;

public class CopyMaster extends KeyMaster {

    public CopyMaster(AmazonS3Client client, MirrorContext context, BlockingQueue<Runnable> workQueue, ThreadPoolExecutor executorService) {
        super(client, context, workQueue, executorService);
    }

    protected String getPrefix(MirrorOptions options) { return options.getPrefix(); }
    protected String getBucket(MirrorOptions options) { return options.getSourceBucket(); }

    protected KeyCopyJob getTask(S3ObjectSummary summary) {
        if (summary.getSize() > MirrorOptions.MAX_SINGLE_REQUEST_UPLOAD_FILE_SIZE) {
            return new MultipartKeyCopyJob(client, context, summary, notifyLock);
        }
        return new KeyCopyJob(client, context, summary, notifyLock);
    }
}
