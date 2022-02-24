# After making changes to this script, it must be run in order for it to take
# effect. To run it, go to the root of your local code-dot-org repo and run:
# ruby aws/s3/cdo-curriculum/redirection_rules.rb

require_relative '../../../deployment'
require 'aws-sdk-s3'
require 'dynamic_config/dcdo'

HOST_NAME = "curriculum.code.org"
CODE_STUDIO_HOST_NAME = "studio.code.org"
CODE_ORG_HOST_NAME = "code.org"
BUCKET_NAME = "cdo-curriculum"

routing_rules = [
  {
    condition: {
      key_prefix_equals: "csp/"
    },
    redirect: {
      host_name: CODE_STUDIO_HOST_NAME,
      replace_key_prefix_with: "courses/csp/"
    }
  },
  {
    condition: {
      key_prefix_equals: "csp-current/"
    },
    redirect: {
      host_name: CODE_STUDIO_HOST_NAME,
      replace_key_prefix_with: "courses/csp/",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "csd/"
    },
    redirect: {
      host_name: CODE_STUDIO_HOST_NAME,
      replace_key_prefix_with: "courses/csd/"
    }
  },
  {
    condition: {
      key_prefix_equals: "csd-current/"
    },
    redirect: {
      host_name: CODE_STUDIO_HOST_NAME,
      replace_key_prefix_with: "courses/csd/",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "csf/"
    },
    redirect: {
      host_name: CODE_ORG_HOST_NAME,
      replace_key_prefix_with: "educate/curriculum/csf"
    }
  },
  {
    condition: {
      key_prefix_equals: "csf-current/"
    },
    redirect: {
      host_name: CODE_ORG_HOST_NAME,
      replace_key_prefix_with: "educate/curriculum/csf",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "hoc-current/"
    },
    redirect: {
      host_name: CODE_ORG_HOST_NAME,
      replace_key_prefix_with: "learn/",
      http_redirect_code: "302"
    }
  },

  {
    condition: {
      key_prefix_equals: "plcsf/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsf-21/",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "plcsf-current/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsf-21/",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "plcsd/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsd-21/",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "plcsd-current/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsd-21/",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "plcsp/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsp-21/",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "plcsp-current/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "plcsp-21/",
      http_redirect_code: "302"
    }
  },
  {
    condition: {
      key_prefix_equals: "documentation/"
    },
    redirect: {
      host_name: HOST_NAME,
      replace_key_prefix_with: "docs/"
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

CDO.curriculum_languages.each do |lang|
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
