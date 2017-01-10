package org.cobbzilla.s3s3mirror;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.ObjectMetadata;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.RandomStringUtils;
import org.junit.After;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.cobbzilla.s3s3mirror.MirrorOptions.*;
import static org.cobbzilla.s3s3mirror.TestFile.Clean;
import static org.cobbzilla.s3s3mirror.TestFile.Copy;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

@Slf4j
public class MirrorTest {

    public static final String SOURCE_ENV_VAR = "S3S3_TEST_SOURCE";
    public static final String DEST_ENV_VAR = "S3S3_TEST_DEST";

    public static final String SOURCE = System.getenv(SOURCE_ENV_VAR);
    public static final String DESTINATION = System.getenv(DEST_ENV_VAR);

    private List<S3Asset> stuffToCleanup = new ArrayList<S3Asset>();

    // Every individual test *must* initialize the "main" instance variable, otherwise NPE gets thrown here.
    private MirrorMain main = null;

    private TestFile createTestFile(String key, Copy copy, Clean clean) throws Exception {
        return TestFile.create(key, main.getClient(), stuffToCleanup, copy, clean);
    }

    public static String random(int size) {
        return RandomStringUtils.randomAlphanumeric(size) + "_" + System.currentTimeMillis();
    }

    private boolean checkEnvs() {
        if (SOURCE == null || DESTINATION == null) {
            log.warn("No "+SOURCE_ENV_VAR+" and/or no "+DEST_ENV_VAR+" found in enviroment, skipping test");
            return false;
        }
        return true;
    }

    @After
    public void cleanupS3Assets () {
        // Every individual test *must* initialize the "main" instance variable, otherwise NPE gets thrown here.
        if (checkEnvs()) {
            AmazonS3Client client = main.getClient();
            for (S3Asset asset : stuffToCleanup) {
                try {
                    log.info("cleanupS3Assets: deleting "+asset);
                    client.deleteObject(asset.bucket, asset.key);
                } catch (Exception e) {
                    log.error("Error cleaning up object: "+asset+": "+e.getMessage());
                }
            }
            main = null;
        }
    }

    @Test
    public void testSimpleCopy () throws Exception {
        if (!checkEnvs()) return;
        final String key = "testSimpleCopy_"+random(10);
        final String[] args = {OPT_VERBOSE, OPT_PREFIX, key, SOURCE, DESTINATION};

        testSimpleCopyInternal(key, args);
    }

    @Test
    public void testSimpleCopyWithInlinePrefix () throws Exception {
        if (!checkEnvs()) return;
        final String key = "testSimpleCopyWithInlinePrefix_"+random(10);
        final String[] args = {OPT_VERBOSE, SOURCE + "/" + key, DESTINATION};

        testSimpleCopyInternal(key, args);
    }

    private void testSimpleCopyInternal(String key, String[] args) throws Exception {

        main = new MirrorMain(args);
        main.init();

        final TestFile testFile = createTestFile(key, Copy.SOURCE, Clean.SOURCE_AND_DEST);

        main.run();

        assertEquals(1, main.getContext().getStats().objectsCopied.get());
        assertEquals(testFile.data.length(), main.getContext().getStats().bytesCopied.get());

        final ObjectMetadata metadata = main.getClient().getObjectMetadata(DESTINATION, key);
        assertEquals(testFile.data.length(), metadata.getContentLength());
    }

    @Test
    public void testSimpleCopyWithDestPrefix () throws Exception {
        if (!checkEnvs()) return;
        final String key = "testSimpleCopyWithDestPrefix_"+random(10);
        final String destKey = "dest_testSimpleCopyWithDestPrefix_"+random(10);
        final String[] args = {OPT_PREFIX, key, OPT_DEST_PREFIX, destKey, SOURCE, DESTINATION};
        testSimpleCopyWithDestPrefixInternal(key, destKey, args);
    }

    @Test
    public void testSimpleCopyWithInlineDestPrefix () throws Exception {
        if (!checkEnvs()) return;
        final String key = "testSimpleCopyWithInlineDestPrefix_"+random(10);
        final String destKey = "dest_testSimpleCopyWithInlineDestPrefix_"+random(10);
        final String[] args = {SOURCE+"/"+key, DESTINATION+"/"+destKey };
        testSimpleCopyWithDestPrefixInternal(key, destKey, args);
    }

    private void testSimpleCopyWithDestPrefixInternal(String key, String destKey, String[] args) throws Exception {
        main = new MirrorMain(args);
        main.init();

        final TestFile testFile = createTestFile(key, Copy.SOURCE, Clean.SOURCE);
        stuffToCleanup.add(new S3Asset(DESTINATION, destKey));

        main.run();

        assertEquals(1, main.getContext().getStats().objectsCopied.get());
        assertEquals(testFile.data.length(), main.getContext().getStats().bytesCopied.get());

        final ObjectMetadata metadata = main.getClient().getObjectMetadata(DESTINATION, destKey);
        assertEquals(testFile.data.length(), metadata.getContentLength());
    }

    @Test
    public void testDeleteRemoved () throws Exception {
        if (!checkEnvs()) return;

        final String key = "testDeleteRemoved_"+random(10);

        main = new MirrorMain(new String[]{OPT_VERBOSE, OPT_PREFIX, key,
                                           OPT_DELETE_REMOVED, SOURCE, DESTINATION});
        main.init();

        // Write some files to dest
        final int numDestFiles = 3;
        final String[] destKeys = new String[numDestFiles];
        final TestFile[] destFiles = new TestFile[numDestFiles];
        for (int i=0; i<numDestFiles; i++) {
            destKeys[i] = key + "-dest" + i;
            destFiles[i] = createTestFile(destKeys[i], Copy.DEST, Clean.DEST);
        }

        // Write 1 file to source
        final String srcKey = key + "-src";
        final TestFile srcFile = createTestFile(srcKey, Copy.SOURCE, Clean.SOURCE_AND_DEST);

        // Initiate copy
        main.run();

        // Expect only 1 copy and numDestFiles deletes
        assertEquals(1, main.getContext().getStats().objectsCopied.get());
        assertEquals(numDestFiles, main.getContext().getStats().objectsDeleted.get());

        // Expect none of the original dest files to be there anymore
        for (int i=0; i<numDestFiles; i++) {
            try {
                main.getClient().getObjectMetadata(DESTINATION, destKeys[i]);
                fail("testDeleteRemoved: expected "+destKeys[i]+" to be removed from destination bucket "+DESTINATION);
            } catch (AmazonS3Exception e) {
                if (e.getStatusCode() != 404) {
                    fail("testDeleteRemoved: unexpected exception (expected statusCode == 404): "+e);
                }
            }
        }

        // Expect source file to now be present in both source and destination buckets
        ObjectMetadata metadata;
        metadata = main.getClient().getObjectMetadata(SOURCE, srcKey);
        assertEquals(srcFile.data.length(), metadata.getContentLength());

        metadata = main.getClient().getObjectMetadata(DESTINATION, srcKey);
        assertEquals(srcFile.data.length(), metadata.getContentLength());
    }

}
