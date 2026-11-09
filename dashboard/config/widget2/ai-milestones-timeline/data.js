const milestones = [
  {
    id: 'turing',
    title: "Alan Turing's Foundational Ideas",
    period: '~1950',
    category: 'Early Ideas',
    eraClass: 'era-early-ideas',
    what: "Alan Turing helped give machine intelligence one of its defining early questions: <em>Can machines think?</em> Rather than trying to define thinking directly, he proposed the imitation game, now known as the Turing Test, in which a human judge tries to distinguish a machine from a person through written responses.<sup class='fn'>1</sup>",
    why: "Turing's ideas shaped later debates about machine intelligence by offering a practical way to think about whether a machine could appear intelligent. His 1950 paper became one of the best-known starting points for discussions of artificial intelligence.<sup class='fn'>2</sup>",
    today: "The Turing Test is still debated today. As chatbots generate increasingly fluent responses, people continue to ask: <em>What does it actually mean for a machine to think?</em><sup class='fn'>1</sup>",
    turningPoint: "Many students argue this is the biggest turning point because AI needed a clear question before it could become a field of study."
  },
  {
    id: 'dartmouth',
    title: 'Dartmouth Conference',
    period: '1956',
    category: 'Early Ideas',
    eraClass: 'era-early-ideas',
    what: "A group of scientists met at Dartmouth College for the Dartmouth Summer Research Project on Artificial Intelligence, a 1956 workshop often treated as the starting point of AI as a research field.<sup class='fn'>1</sup> Led by John McCarthy, Marvin Minsky, Claude Shannon, and Nathaniel Rochester, the workshop explored whether machines could simulate aspects of intelligence such as language, learning, and reasoning.<sup class='fn'>2</sup>",
    why: "This meeting helped launch AI as a formal research discipline. It gave the field a name, gathered a community of early researchers, and set ambitious goals for studying machine intelligence.<sup class='fn'>1</sup>",
    today: "The same optimism — and the same gap between big promises and hard technical realities — has appeared in later waves of AI, from AI winters to today's generative AI boom.<sup class='fn'>2</sup>",
    turningPoint: "Many students argue this is the biggest turning point because giving AI a name, a community, and a research agenda helped make it a real field."
  },
  {
    id: 'symbolic',
    title: 'Symbolic AI',
    period: '1950s–1970s',
    category: 'Rule-based AI',
    eraClass: 'era-rule-based',
    what: "Researchers built AI systems by translating knowledge and reasoning into explicit symbols, rules, and algorithms. In expert systems, human expertise was often encoded as <em>if-then</em> rules a computer could follow: if the situation is X, infer or do Y.<sup class='fn'>1</sup>",
    why: "This became a major early approach to AI. It worked best in narrow, well-defined domains, such as logic puzzles, controlled “microworlds,” and expert systems, but struggled when problems required common sense or flexible understanding beyond the rules it had been given.<sup class='fn'>2</sup>",
    today: "Rule-based and expert-system ideas still appear in areas where knowledge can be clearly defined, such as medical diagnosis tools, credit authorization, financial management, scheduling, and automated help systems.<sup class='fn'>2</sup>",
    turningPoint: "Many students argue this is the biggest turning point because it showed both the promise and the limits of trying to build intelligence from hand-written rules."
  },
  {
    id: 'eliza',
    title: 'ELIZA',
    period: '1966',
    category: 'Rule-based AI',
    eraClass: 'era-rule-based',
    what: "Joseph Weizenbaum created ELIZA, an early chatbot that used keyword matching and simple rules to imitate the style of a Rogerian psychotherapist. If a user typed something like <q>I feel sad,</q> ELIZA could reflect the phrase back as a question, creating the feeling of a conversation even though it did not understand the user.<sup class='fn'>1</sup>",
    why: "ELIZA showed that even simple rule-based responses could seem surprisingly human. People sometimes treated the program as if it understood them, raising early questions about trust, emotional attachment, and the illusion of machine empathy.<sup class='fn'>1</sup>",
    today: "Modern chatbots use far more advanced language models instead of hand-written scripts, but the same concern remains: people can form real emotional connections with AI systems that do not actually feel or understand.<sup class='fn'>2</sup>",
    turningPoint: "Many students argue this is the biggest turning point because it revealed how easily people can project understanding and empathy onto machines — a pattern that still shapes AI design today."
  },
  {
    id: 'expert-systems',
    title: 'Expert Systems',
    period: '1970s–1980s',
    category: 'Rule-based AI',
    eraClass: 'era-rule-based',
    what: "Expert systems encoded the knowledge of human specialists as organized facts and <em>if-then</em> rules. Using a knowledge base and an inference engine, they could make recommendations or solve problems in narrow domains that normally required human expertise.<sup class='fn'>1</sup>",
    why: "Expert systems were among the first AI approaches to find serious practical and commercial use. Systems such as MYCIN showed that AI could capture specialized expertise, reason through uncertainty, and explain its conclusions — even though trust, liability, brittleness, and limited common sense made real-world adoption difficult.<sup class='fn'>2</sup>",
    today: "Expert-system thinking still appears in areas where knowledge can be clearly defined, such as medical diagnosis, financial decision-making, engineering, scheduling, monitoring, and planning — often as an aid to human experts rather than a full replacement.<sup class='fn'>1</sup>",
    turningPoint: "Many students argue this is the biggest turning point because expert systems showed AI could be practically useful — while also revealing how hard it is to turn human expertise into reliable rules."
  },
  {
    id: 'ai-winters',
    title: 'AI Winters',
    period: '1974–1980 &amp; 1987–1993',
    category: 'Limits / Setbacks',
    eraClass: 'era-limits',
    what: "Twice in AI history, enthusiasm and funding collapsed after periods of high expectations. Researchers and institutions had promised more than the technology could deliver, systems struggled outside narrow or controlled settings, and governments and companies pulled back support.<sup class='fn'>1</sup>",
    why: "The AI winters showed that hype cycles have real consequences. When expectations outran results, research funding shrank, companies failed, and many researchers moved into other fields, forcing AI to rebuild around more specific and achievable goals.<sup class='fn'>1</sup>",
    today: "Researchers and investors still debate whether today's AI boom could face a similar correction if current systems hit technical limits, become too expensive to scale, or fail to deliver enough real-world value.<sup class='fn'>1</sup>",
    turningPoint: "Many students argue this is the biggest turning point because the crashes forced the field to confront the gap between impressive demos and reliable real-world intelligence."
  },
  {
    id: 'ml-shift',
    title: 'Machine Learning Shift',
    period: '1980s–2000s',
    category: 'Learning from Data',
    eraClass: 'era-learning',
    what: "Instead of relying mainly on hand-written rules, researchers increasingly built systems that could <em>learn patterns from data</em>. In the 1990s, statistical learning methods such as support vector machines, Bayesian networks, and ensemble methods made probability, optimization, and prediction more central to AI.<sup class='fn'>1</sup>",
    why: "This shift helped AI move from brittle rule-based systems toward models that could recognize patterns across larger and messier datasets. As digital data and computing power grew in the 2000s, machine learning became more practical and set the stage for later breakthroughs in speech processing, computer vision, recommendation systems, and natural language processing.<sup class='fn'>1</sup>",
    today: "Many everyday AI products — from streaming recommendations and virtual assistants to language tools and healthcare diagnostics — rely on machine learning principles that grew out of this shift toward data-driven systems.<sup class='fn'>1</sup>",
    turningPoint: "Many students argue this is the biggest turning point because it changed the central question from <em>How do we write the rules?</em> to <em>How can systems learn from data?</em>"
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    period: '2010s',
    category: 'Learning from Data',
    eraClass: 'era-learning',
    what: "Large datasets and GPU computing made deep neural networks practical at a new scale. In 2012, AlexNet brought together deep neural networks, ImageNet’s massive labeled image dataset, and GPUs to achieve a breakthrough in image recognition.<sup class='fn'>1</sup>",
    why: "AlexNet helped spark the modern deep learning era. It showed that neural networks could learn powerful features from data instead of relying on hand-engineered image features, and it quickly shifted computer vision toward deep learning.<sup class='fn'>2</sup>",
    today: "Deep learning now powers many AI systems, including image recognition, speech and language tools, medical imaging analysis, and generative AI. AlexNet was one early turning point in the broader wave that later produced systems able to synthesize voices, play Go at champion level, generate artwork, and build advanced chatbots.<sup class='fn'>1</sup>",
    turningPoint: "Many students argue this is the biggest turning point because it showed how much AI could improve when better algorithms, large datasets, and powerful computing came together."
  },
  {
    id: 'transformers',
    title: 'Transformers &amp; Large Language Models',
    period: '2017–present',
    category: 'Modern Generative AI',
    eraClass: 'era-modern',
    what: "The Transformer architecture, introduced in the 2017 paper <em>Attention Is All You Need</em>, changed how AI systems process language by using attention to weigh relationships between words and process sequences more efficiently. This architecture helped lead to models such as BERT, GPT, and eventually ChatGPT.<sup class='fn'>1</sup>",
    why: "Large language models built on Transformer ideas can generate fluent text, answer questions, summarize information, write code, and power conversational AI systems. GPT models in particular use a Transformer-based design to predict and generate text one token at a time.<sup class='fn'>1</sup>",
    today: "You're living in this era. Since ChatGPT brought GPT-style models into public use, generative AI tools have begun reshaping tasks such as writing, tutoring, technical support, coding assistance, and workplace automation — while raising difficult questions about accuracy, authorship, bias, and trust.<sup class='fn'>2</sup>",
    turningPoint: "Many students argue this is the biggest turning point because it explains the AI tools people are using right now — and the social questions we are still trying to answer."
  }
];
