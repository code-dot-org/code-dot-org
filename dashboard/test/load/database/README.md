# Using Sysbench for Database Load Testing

[sysbench](https://github.com/akopytov/sysbench) is a scriptable multi-threaded benchmark tool based on LuaJIT. It is most frequently used for database benchmarks, but can also be used to create arbitrarily complex workloads that do not involve a database server.  AWS has published [a white paper](https://d1.awsstatic.com/product-marketing/Aurora/RDS_Aurora_Performance_Assessment_Benchmarking_v1-2.pdf) outlining steps to assess the performance of an RDS Aurora database.

## Setup

Here are steps to using sysbench to carry out benchmark testing of the Code.org Aurora database:

1. **Create Stack** - Provision a load test CloudFormation Stack using dashboard/test/load/database/aurora-loadtest.yml setting the DBClusterIdentifier Parameter to the identifier that you plan to use for the load test database cluster that you will provision in the next step. Beware that AWS automatically adds `-cluster` to the end of the identifier you specify when creating the Database cluster in step 2, so include that suffix here.
1. **Create Database Cluster**
    1. Restore a recent Snapshot of the production Aurora cluster into the VPC created by the load test Stack, configuring it to use the VPC, DB Subnet Group and MySQL Security Group created by the load test Stack and using the production Cluster Parameter Group and Writer Instance Parameter Group. Enable Performance Insights on the cluster and enable all log types (Slow Query, Error, General, etc.).
    1. After the restore is complete, change the password of the admin user via the AWS web console using the Modify Database Instance page.
1. **Install git** - Install git on the sysbench server: `sudo yum -y -q install git`
1. **Clone code-dot-org Repository** - Clone the code-dot-org repository to the EC2 Instance provisioned by the load test Stack so we can invoke load test scripts committed to the repository: `git clone https://github.com/code-dot-org/code-dot-org.git`
1. **Setup sysbench** - Build and install sysbench by executing the setup script on the sysbench EC2 Instance: `dashboard/test/load/database/setup.sh` 
1. **Execute Load Test**
    1. The following 2 shell scripts execute sysbench load tests:
        1. `dashboard/test/load/database/runload-production-clone.sh`
        1. `dashboard/test/load/database/runload.sh`
    1. Both scripts take 3 arguments in the following order
        1. **Database server name** - The name of the database sysbench should connect to to execute SQL load tests, typically the writer endpoint of the load test Aurora database cluster.
        1. **Sysbench script** - Name of the Lua script in the code-dot-org repository directory (`dashboard/test/load/database/lua/`) that sysbench should execute for the load test.
        1. **Password** - Credentials for the admin database user.
    1. Example Usage:
```    
    $ cd /home/ec2-user/code-dot-org/dashboard/test/load/database
    $ ./runload-production-clone.sh load-test-cluster-writer-endpoint cdo_top_read_queries.lua PasswordForSQLUser
```
1. **Delete Database Cluster and Stack** - When load testing is complete, delete the performance testing Aurora cluster and the load test CloudFormation Stack.




