---
title: Learn about Artificial Intelligence (AI)
---

{{ ai_header_stylesheets_links }}

# Learn about Artificial Intelligence (AI)
AI and Machine Learning impact our entire world, changing how we live and how we work. That's why it’s critical for all of us to understand this increasingly important technology, including not just how it’s designed and applied, but also its societal and ethical implications.

Join us to explore AI in a new video series, train AI for Oceans in 25+ languages, discuss ethics, and more!

{{ ai_20px_margin }}

{{ ai_for_oceans_tile }}

{{ how_ai_works_tile }}

{{ ai_and_ethics_tile }}

{{ ai_20px_margin }}

{{ ai_microsoft_block }}

{{ ai_videos_link }}

## How AI Works

With an introduction by Microsoft CEO Satya Nadella, this series of short videos will introduce you to how artificial intelligence works and why it matters. Learn about neural networks, or how AI learns, and delve into issues like algorithmic bias and the ethics of AI decision-making.

{{ ai_vid_intro }}
{{ ai_vid_mlintro }}

{{ ai_clear_div }}

{{ ai_vid_trainingdata }}
{{ ai_vid_neuralnetworks }}

{{ ai_clear_div }}

{{ ai_vid_computervision }}
{{ ai_vid_ethics1 }}

{{ ai_clear_div }}

{{ ai_vid_ethics2 }}

{{ ai_clear_div }}

{{ ai_videos_panel }}



### Videos about AI from other organizations:
- [Seeing AI: Making the visual world more accessible](https://youtu.be/DybczED-GKE) (3:27)
- [Fighting bias in algorithms](https://youtu.be/UG_X_7g63rY) (8:44)
- [Machine Learning and Human Bias](https://youtu.be/59bMh59JQDo) (2:33)
- [The Ethics of AI](https://youtu.be/GboOXAjGevA) (8:03)
- [Machine Learning: Solving Problems Big, Small, and Prickly](https://youtu.be/_rdINNHLYaQ) (5:19)
- [How does your phone know this is a dog?](https://youtu.be/bHvf7Tagt18) (5:57)
- [What is AI?](https://youtu.be/mJeNghZXtMo) (6:14)

## More resources

{{ ai_resource_tiles }}

## Activities Powered by AI and ML
{{ ai_activities_table }}

## Teach and Learn about AI
{{ ai_teach_and_learn_table }}



### AI for Oceans: Behind the Scenes

Levels 2-4 use a pretrained model provided by the [TensorFlow](https://www.tensorflow.org/) [MobileNet](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md) project. A MobileNet model is a [convolutional neural network](https://developers.google.com/machine-learning/practica/image-classification/convolutional-neural-networks) that has been trained on [ImageNet](http://www.image-net.org/), a dataset of over 14 million images hand-annotated with words such as "balloon" or "strawberry". In order to customize this model with the labeled training data the student generates in this activity, we use a technique called [Transfer Learning](https://en.wikipedia.org/wiki/Transfer_learning). Each image in the training dataset is fed to MobileNet, as pixels, to obtain a list of annotations that are most likely to apply to it. Then, for a new image, we feed it to MobileNet and compare its resulting list of annotations to those from the training dataset. We classify the new image with the same label (such as "fish" or "not fish") as the images from the training set with the most similar results.

Levels 6-8 use a [Support-Vector Machine] (https://en.wikipedia.org/wiki/Support-vector_machine) (SVM). We look at each component of the fish (such as eyes, mouth, body) and assemble all of the metadata for the components (such as number of teeth, body shape) into a vector of numbers for each fish. We use these vectors to train the SVM. Based on the training data, the SVM separates the "space" of all possible fish into two parts, which correspond to the classes we are trying to learn (such as "blue" or "not blue").

[[Back to top]](#top)
