# Amazon's Elastic MapReduce

This directory is intended to contain data and programs associated with Amazon's Elastic MapReduce
(EMR). The [wiki page](http://wiki.code.org/pages/viewpage.action?pageId=692076) contains
instructions for getting started on running EMRs through the AWS and s3 CLIs.

This directory and its subdirectories is intended to mirror those files in s3 that are appropriate
to share with the public (e.g., most everything except stuff containing PII). In particular, the
directories s3://myawsbucket/mysubdir/ and files s3://mawsbucket/mysubdir/myfile and the
directories code-dot-org/aws/emr/myawsbucket/mysubdir/ and
files code-dot-org/aws/emr/myawsbucket/mysubdir/myfile should be mirrors. Per convention, we will
use the s3 subdirectories s3://myawsbucket/logs/, s3://myawsbucket/input/, s3://myawsbucket/output/,
s3://myawsbucket/script/.
