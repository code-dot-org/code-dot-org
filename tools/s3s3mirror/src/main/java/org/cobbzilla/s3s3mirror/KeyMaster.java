package org.cobbzilla.s3s3mirror;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
public abstract class KeyMaster implements Runnable {

    public static final int STOP_TIMEOUT_SECONDS = 10;
    private static final long STOP_TIMEOUT = TimeUnit.SECONDS.toMillis(STOP_TIMEOUT_SECONDS);

    protected AmazonS3Client client;
    protected MirrorContext context;

    private AtomicBoolean done = new AtomicBoolean(false);
    public boolean isDone () { return done.get(); }

    private BlockingQueue<Runnable> workQueue;
    private ThreadPoolExecutor executorService;
    protected final Object notifyLock = new Object();

    private Thread thread;

    public KeyMaster(AmazonS3Client client, MirrorContext context, BlockingQueue<Runnable> workQueue, ThreadPoolExecutor executorService) {
        this.client = client;
        this.context = context;
        this.workQueue = workQueue;
        this.executorService = executorService;
    }

    protected abstract String getPrefix(MirrorOptions options);
    protected abstract String getBucket(MirrorOptions options);

    protected abstract KeyJob getTask(S3ObjectSummary summary);

    public void start () {
        this.thread = new Thread(this);
        this.thread.start();
    }

    public void stop () {
        final String name = getClass().getSimpleName();
        final long start = System.currentTimeMillis();
        log.info("stopping "+ name +"...");
        try {
            if (isDone()) return;
            this.thread.interrupt();
            while (!isDone() && System.currentTimeMillis() - start < STOP_TIMEOUT) {
                if (Sleep.sleep(50)) return;
            }
        } finally {
            if (!isDone()) {
                try {
                    log.warn(name+" didn't stop within "+STOP_TIMEOUT_SECONDS+" after interrupting it, forcibly killing the thread...");
                    this.thread.stop();
                } catch (Exception e) {
                    log.error("Error calling Thread.stop on " + name + ": " + e, e);
                }
            }
            if (isDone()) log.info(name+" stopped");
        }
    }

    public void run() {

        final MirrorOptions options = context.getOptions();
        final boolean verbose = options.isVerbose();

        final int maxQueueCapacity = MirrorMaster.getMaxQueueCapacity(options);

        int counter = 0;
        try {
            final KeyLister lister = new KeyLister(client, context, maxQueueCapacity, getBucket(options), getPrefix(options));
            executorService.submit(lister);

            List<S3ObjectSummary> summaries = lister.getNextBatch();
            if (verbose) log.info(summaries.size()+" keys found in first batch from source bucket -- processing...");

            while (true) {
                for (S3ObjectSummary summary : summaries) {
                    while (workQueue.size() >= maxQueueCapacity) {
                        try {
                            synchronized (notifyLock) {
                                notifyLock.wait(50);
                            }
                            Thread.sleep(50);

                        } catch (InterruptedException e) {
                            log.error("interrupted!");
                            return;
                        }
                    }
                    executorService.submit(getTask(summary));
                    counter++;
                }

                summaries = lister.getNextBatch();
                if (summaries.size() > 0) {
                    if (verbose) log.info(summaries.size()+" more keys found in source bucket -- continuing (queue size="+workQueue.size()+", total processed="+counter+")...");

                } else if (lister.isDone()) {
                    if (verbose) log.info("No more keys found in source bucket -- ALL DONE");
                    return;

                } else {
                    if (verbose) log.info("Lister has no keys queued, but is not done, waiting and retrying");
                    if (Sleep.sleep(50)) return;
                }
            }

        } catch (Exception e) {
            log.error("Unexpected exception in MirrorMaster: "+e, e);

        } finally {
            while (workQueue.size() > 0 || executorService.getActiveCount() > 0) {
                // wait for the queue to be empty
                if (Sleep.sleep(100)) break;
            }
            // this will wait for currently executing tasks to finish
            executorService.shutdown();
            done.set(true);
        }
    }
}
