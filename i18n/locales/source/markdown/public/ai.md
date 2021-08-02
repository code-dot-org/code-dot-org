---
title: Learn about Artificial Intelligence (AI)
---

{{ ai_header_stylesheets_links }}

# Learn about Artificial Intelligence (AI)
<div style="background: url(/images/ai/ai-bg.png) top left no-repeat #00adbc;padding:10px 20px 10px; color:#ffffff; margin-bottom:15px">
<div class="col-40" style="margin-bottom:15px">
<h2 style="color:#ffffff; margin-top:25px">NEW AI and Machine Learning Module</h2><p>Our new curriculum module focuses on AI ethics, examines issues of bias, and explores and explains fundamental concepts through a number of online and unplugged activities and full-group discussions.</p><a  href="#about-aimodule"><button>Learn more</button></a>&nbsp;&nbsp;<a class="linktag" id="aimodule" href="https://studio.code.org/s/aiml-2021?viewAs=Teacher" target="_blank"><button>Explore the module</button></a></div>
<div class="col-60" style="padding: 30px 10px 0 20px;margin-bottom:15px" ><img src="/images/ai/ailab.gif" style="max-width: 100%" alt="AI Lab"/></div>
<div class="clear"></div>
</div>

AI and Machine Learning impact our entire world, changing how we live and how we work. That's why it’s critical for all of us to understand this increasingly important technology, including not just how it’s designed and applied, but also its societal and ethical implications.

Join us to explore AI in a new video series, train AI for Oceans in 25+ languages, discuss ethics, and more!

{{ ai_20px_margin }}

{{ ai_for_oceans_tile }}

{{ how_ai_works_tile }}

{{ ai_and_ethics_tile }}

{{ ai_20px_margin }}

{{ ai_microsoft_block }}

{{ ai_videos_link }}

<a id="about-aimodule"></a>
## NEW AI and Machine Learning Module
<div>
<div class="col-50">
<p>The AI and Machine Learning Module is roughly a five week curriculum module that can be taught as a <a href="https://studio.code.org/s/aiml-2021?viewAs=Teacher" >standalone module</a> or as an optional <a href="https://studio.code.org/s/csd7-2021">unit in CS Discoveries</a>. It focuses on AI ethics, examines issues of bias, and explores and explains fundamental concepts</p><p>Because machine learning depends on large sets of data, the new unit includes real life datasets on healthcare, demographics, and more to engage students while exploring questions like, “What is a problem Machine Learning can help solve?” “How can AI help society?” “Who is benefiting from AI?” “Who is being harmed?” “Who is involved?” “Who is missing?”  </p>
<p>Ethical considerations will be at the forefront of these discussions, with frequent discussion points and lessons around the impacts of these technologies. This will help students develop a holistic, thoughtful understanding of these technologies while they learn the technical underpinnings of how the technologies work.</p>
</div>
<div class="col-50" style="padding: 0 0 15px 25px"><p  style="text-align:right;"><img src="/images/ai/ai-modelcard.png" style="max-width: 100%"/></p><a class="linktag" id="aimodule2" href="https://studio.code.org/s/aiml-2021" target="_blank"><button>Explore the module</button></a></div>
<div class="clear"></div>
</div>

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
- [Machine Learning Explained in 5 Minutes](https://youtu.be/3bJ7RChxMWQ) (5:14)
- [Types of Machine Learning](https://youtu.be/wy-m6sd1BOA) (6:37)
- [What is Machine Learning and How does it Work?](https://youtu.be/xr5LeWKbVnY) (3:51)


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