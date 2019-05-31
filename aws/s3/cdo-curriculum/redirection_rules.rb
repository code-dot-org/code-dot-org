require_relative '../../../deployment'
require 'aws-sdk-s3'

HOST_NAME = "curriculum.code.org"
BUCKET_NAME = "cdo-curriculum"

routing_rules = [
  {
    condition: {
      key_prefix_equals: "csp/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "csp-current/"
    }
  },
  {
    condition: {
      key_prefix_equals: "csp-current/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "csp-19/"
    }
  },
  {
    condition: {
      key_prefix_equals: "csd/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "csd-current/"
    }
  },
  {
    condition: {
      key_prefix_equals: "csd-current/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "csd-19/"
    }
  },
  {
    condition: {
      key_prefix_equals: "csf/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "csf-current/"
    }
  },
  {
    condition: {
      key_prefix_equals: "csf-current/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "csf-19/"
    }
  },
  {
    condition: {
      key_prefix_equals: "plcsf/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsf-19/"
    }
  },
  {
    condition: {
      key_prefix_equals: "plcsd/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsd-19/"
    }
  },
  {
    condition: {
      key_prefix_equals: "plcsp/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsp-19/"
    }
  },
  {
    condition: {
      key_prefix_equals: "docs/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "documentation"
    }
  },
]

website_configuration = {
  error_document: {
    key: "404.html"
  },
  index_document: {
    suffix: "index.html"
  },
  routing_rules: routing_rules
}

CDO.class::CURRICULUM_LANGUAGES.each do |lang|
  routing_rules << {
    condition: {
      http_error_code_returned_equals: "404",
      key_prefix_equals: "#{lang}/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: ""
    }
  }
end

bucket_website = Aws::S3::BucketWebsite.new(bucket_name: BUCKET_NAME)

bucket_website.put(
  {
    website_configuration: website_configuration
  }
)
