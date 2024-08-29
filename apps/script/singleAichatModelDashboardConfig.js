const modelName = 'gen-ai-mistral-7b-inst-v01';

const config = `{
    "widgets": [
      {
        "height": 9,
        "width": 8,
        "y": 12,
        "x": 0,
        "type": "metric",
        "properties": {
          "view": "timeSeries",
          "stacked": false,
          "metrics": [
            [
              "/aws/sagemaker/Endpoints",
              "CPUUtilization",
              "EndpointName",
              "${modelName}",
              "VariantName",
              "AllTraffic",
              {
                "region": "us-east-1"
              }
            ]
          ],
          "region": "us-east-1",
          "title": "CPU Utilization - ${modelName}",
          "period": 300,
          "yAxis": {
            "left": {
              "min": 0,
              "max": 100
            }
          }
        }
      },
      {
        "height": 9,
        "width": 8,
        "y": 12,
        "x": 8,
        "type": "metric",
        "properties": {
          "view": "timeSeries",
          "stacked": false,
          "metrics": [
            [
              "/aws/sagemaker/Endpoints",
              "GPUUtilization",
              "EndpointName",
              "${modelName}",
              "VariantName",
              "AllTraffic",
              {
                "region": "us-east-1"
              }
            ],
            [
              ".",
              "GPUMemoryUtilization",
              ".",
              ".",
              ".",
              ".",
              {
                "region": "us-east-1"
              }
            ]
          ],
          "region": "us-east-1",
          "period": 300,
          "title": "GPU Utilization - ${modelName}",
          "yAxis": {
            "left": {
              "min": 0,
              "max": 100
            }
          }
        }
      },
      {
        "height": 9,
        "width": 8,
        "y": 12,
        "x": 16,
        "type": "metric",
        "properties": {
          "view": "timeSeries",
          "stacked": false,
          "metrics": [
            [
              "/aws/sagemaker/Endpoints",
              "DiskUtilization",
              "EndpointName",
              "${modelName}",
              "VariantName",
              "AllTraffic",
              {
                "region": "us-east-1"
              }
            ],
            [
              ".",
              "MemoryUtilization",
              ".",
              ".",
              ".",
              ".",
              {
                "region": "us-east-1"
              }
            ]
          ],
          "region": "us-east-1",
          "title": "Memory & Disk Utilization - ${modelName}",
          "period": 300,
          "yAxis": {
            "left": {
              "min": 0,
              "max": 100,
              "label": ""
            }
          }
        }
      },
      {
        "height": 9,
        "width": 8,
        "y": 3,
        "x": 0,
        "type": "metric",
        "properties": {
          "metrics": [
            [
              "AWS/SageMaker",
              "Invocations",
              "EndpointName",
              "${modelName}",
              "VariantName",
              "AllTraffic",
              "EndpointConfigName",
              "${modelName}",
              {
                "region": "us-east-1"
              }
            ],
            [
              ".",
              "InvocationsPerInstance",
              ".",
              ".",
              ".",
              ".",
              {
                "region": "us-east-1"
              }
            ]
          ],
          "view": "timeSeries",
          "stacked": false,
          "region": "us-east-1",
          "title": "Invocations - ${modelName}",
          "period": 300,
          "stat": "Sum"
        }
      },
      {
        "height": 9,
        "width": 6,
        "y": 3,
        "x": 8,
        "type": "metric",
        "properties": {
          "view": "timeSeries",
          "stacked": false,
          "metrics": [
            [
              "AWS/SageMaker",
              "ModelLatency",
              "EndpointName",
              "${modelName}",
              "VariantName",
              "AllTraffic",
              "EndpointConfigName",
              "${modelName}",
              {
                "region": "us-east-1"
              }
            ],
            [
              ".",
              "OverheadLatency",
              ".",
              ".",
              ".",
              "."
            ]
          ],
          "region": "us-east-1",
          "title": "Latency - ${modelName}",
          "period": 300
        }
      },
      {
        "height": 9,
        "width": 8,
        "y": 3,
        "x": 16,
        "type": "metric",
        "properties": {
          "view": "timeSeries",
          "stacked": false,
          "metrics": [
            [
              "AWS/SageMaker",
              "InvocationModelErrors",
              "EndpointName",
              "${modelName}",
              "VariantName",
              "AllTraffic",
              "EndpointConfigName",
              "${modelName}"
            ],
            [
              ".",
              "Invocation5XXErrors",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              "Invocation4XXErrors",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ]
          ],
          "region": "us-east-1",
          "title": "Invocation Errors - ${modelName}"
        }
      },
      {
        "height": 1,
        "width": 24,
        "y": 2,
        "x": 0,
        "type": "text",
        "properties": {
          "markdown": "## **${modelName}**"
        }
      },
      {
        "type": "metric",
        "x": 14,
        "y": 3,
        "width": 2,
        "height": 9,
        "properties": {
          "view": "singleValue",
          "stacked": false,
          "metrics": [
            [
              "AWS/SageMaker",
              "OverheadLatency",
              "EndpointName",
              "${modelName}",
              "VariantName",
              "AllTraffic"
            ],
            [
              ".",
              "ModelLatency",
              ".",
              ".",
              ".",
              "."
            ]
          ],
          "region": "us-east-1",
          "setPeriodToTimeRange": true,
          "sparkline": false,
          "trend": false,
          "title": "Average Latency"
        }
      }
    ]
  }`;

const jsonObject = JSON.parse(config);
module.exports = jsonObject;
