# This file is maintained automatically by "tofu init".
# Manual edits may be lost in future updates.

provider "registry.opentofu.org/alekc/kubectl" {
  version     = "2.1.5"
  constraints = "~> 2.1"
  hashes = [
    "h1:ZMqwfwUL49Nvp5LZims1nt7zdE2Lj9rtVHkRobYWBCs=",
    "zh:11d6c7e429d013ce4b224a8e778fa1e272743dd131696039c65f8238d0c5afee",
    "zh:39e55dc62ee6c31032e0ccd4f4d87d28f62ecf2025b726b705327b91235bb5d7",
    "zh:3ef4cc118f1e9586bf794dcc9d0ed7912815df182239c28111fa2d67d4d9f264",
    "zh:4183684cbd5a12c5b716b5d349178ac7cedda277ed0bc5cca2a03e33c0c6ff2d",
    "zh:79e2d64ad8035a4254d40bc0f5064c3bb3a3d38e4e6d969c810f6512a50106f7",
    "zh:91961239727bd01fd145752d5f42877bf8b8087a095ab68c39e3068941cdc09c",
    "zh:a94b91e527d68a85aa5ab020c27d383bfa4aa61bf585248f3591808c8e29841d",
    "zh:b0cdb266cc46d58ef3558f86e94d3d3718c6bb1281f2357c50bd7d2b6828e11a",
    "zh:c6b12ca20041ed7b3cb86ff15cf69f8c6c4ccfe94640b8f45386ebcf26adfc31",
    "zh:d7424e9d3511af81174549716c71da175529e439525fa44746b69ca514ab9022",
    "zh:decb856ecf18a5a51775953233d3203ad2468456a6a28a4ff5243ed2d9a3241e",
    "zh:e2b176e5cd860ea2559965d7bab34ccb6f2edcc6c8b92c1d96853ac1368f0415",
    "zh:f780ee23ce21fb674d57f60320a284cdaf40d3baba4e3f8a274ad4601c989317",
  ]
}

provider "registry.opentofu.org/hashicorp/aws" {
  version     = "6.35.1"
  constraints = ">= 6.0.0, >= 6.28.0"
  hashes = [
    "h1:u7UCkvrSEjxVqR9btJakZNmHOiwRA9Uf2W7HKNxgJ+o=",
    "zh:37f36bade13a8faf3591a7678d186dcb878d20bc9c8b5a5b14b5169f304d8a15",
    "zh:3e284a45a901f6c7d13e227a429422d28b15776bc9bc244c881bf2eb25b5946e",
    "zh:40e498692c148a9f1248693a49cef35c4995e2741df76c393d81d45769c35c45",
    "zh:55828a90c93356c42fb56e1f8e7801b2ba4edf6222a2e0685596d69e47170bde",
    "zh:6b1d2e5c6a9656d45153c12baf694949b887eb86a1a4a5bee322c4315658143a",
    "zh:6f86b0909bff1de398eb789d3a08e9ebb11fd5fa7788967132b8989009a47bc4",
    "zh:7476a9090568e446d3fba448c3ae043098d34fac72f2a33f899dcd2709dda131",
    "zh:88a82f13c140890df295cbe96112d14e812b8a8ad3d59aee2ab2249f83b29c8a",
    "zh:9aa41d22b8db890e3745df35f9f897328ea7853c20eecc22580e284dea5bdcc0",
    "zh:b4d786cbab69f4c50d143e206332adda910613c098df7f89ae09fe04a0f8f9f3",
    "zh:bd371177cb87748585ddc09c95d9159b46305df86da78046d79b46bdbb71f9dc",
    "zh:c5df33dffce9e6468bf17bac743d45fa79321b77edd42121f9baaa677ebc9cc7",
    "zh:cd7ed6a646302d17f6d817a29090fef44efbccd6be4ff5b1c20c6e2a464719c2",
    "zh:f657c681e70727881564c199c58c2eee151f4277a25345f26db7789e78b10223",
    "zh:f8769bb6d13d0ee06edf8a4c1699afd9d03818ea7e9f87c656421772047dc816",
  ]
}

provider "registry.opentofu.org/hashicorp/cloudinit" {
  version     = "2.3.7"
  constraints = ">= 2.0.0"
  hashes = [
    "h1:El6cBCCiCPGwJsSSN0Z+EUWatjI45hie+kIDnTegV9A=",
    "zh:2d48b8452eae9bac2e62273e8f535f73694d8cb05ea38f4b27ee735dcc38eed4",
    "zh:4add11b87e48d0e6ecd19243a06ecfc42fc07d0a3748fe568c2971d5f4767486",
    "zh:4c9c4e3319cf3328595ea2d68eba7c604325fbcba38cd443e39e982b0b4e29f2",
    "zh:503dd83a05b0421ecbcb140d5fdbe3a6b82f163495a82587a1390cf66d7a27be",
    "zh:7dd34de7e68036dbbb70c249968a2a10bccba1cb92d3b4dccbc0eb65a3fc58ea",
    "zh:a4d7b4480d38446b8da96ce4ecbc2e5a081c4ddc3da2bad97d7b228821b77895",
    "zh:bdec6329c3d2d5f034080d9cd6f9a15a2c052faacd716f981e247b48e6845c01",
    "zh:e1519544ae3f67196d144e18c21ad681dc29da3133a537ffdd5c2c6271b8db0c",
    "zh:e58cd6b05ed51a6fa072e5de2208ba36a58557c3fb414d50c42b3d40a11366b7",
    "zh:fafc4a49c297516f2a40490f9a7e6d2b437d77a94330797d4eead178c987ccb5",
  ]
}

provider "registry.opentofu.org/hashicorp/helm" {
  version     = "2.17.0"
  constraints = ">= 2.13.0, < 3.0.0"
  hashes = [
    "h1:ShIag7wqd5Rs+zYpVMpjAh+T0ozr4XGYfSTKWqceQBY=",
    "zh:02690815e35131a42cb9851f63a3369c216af30ad093d05b39001d43da04b56b",
    "zh:27a62f12b29926387f4d71aeeee9f7ffa0ccb81a1b6066ee895716ad050d1b7a",
    "zh:2d0a5babfa73604b3fefc9dab9c87f91c77fce756c2e32b294e9f1290aed26c0",
    "zh:3976400ceba6dda4636e1d297e3097e1831de5628afa534a166de98a70d1dcbe",
    "zh:54440ef14f342b41d75c1aded7487bfcc3f76322b75894235b47b7e89ac4bfa4",
    "zh:6512e2ab9f2fa31cbb90d9249647b5c5798f62eb1215ec44da2cdaa24e38ad25",
    "zh:795f327ca0b8c5368af0ed03d5d4f6da7260692b4b3ca0bd004ed542e683464d",
    "zh:ba659e1d94f224bc3f1fd34cbb9d2663e3a8e734108e5a58eb49eda84b140978",
    "zh:c5c8575c4458835c2acbc3d1ed5570589b14baa2525d8fbd04295c097caf41eb",
    "zh:e0877a5dac3de138e61eefa26b2f5a13305a17259779465899880f70e11314e0",
  ]
}

provider "registry.opentofu.org/hashicorp/http" {
  version     = "3.5.0"
  constraints = ">= 3.0.0"
  hashes = [
    "h1:eClUBisXme48lqiUl3U2+H2a2mzDawS9biqfkd9synw=",
    "zh:0a2b33494eec6a91a183629cf217e073be063624c5d3f70870456ddb478308e9",
    "zh:180f40124fa01b98b3d2f79128646b151818e09d6a1a9ca08e0b032a0b1e9cb1",
    "zh:3e29e1de149dc10bf78620526c7cb8c62cd76087f5630dfaba0e93cda1f3aa7b",
    "zh:4420950200cf86042ec940d0e2c9b7c89966bf556bf8038ba36217eae663bca5",
    "zh:5d1f7d02109b2e2dca7ec626e5563ee765583792d0fd64081286f16f9433bd0d",
    "zh:8500b138d338b1994c4206aa577b5c44e1d7260825babcf43245a7075bfa52a5",
    "zh:b42165a6c4cfb22825938272d12b676e4a6946ac4e750f85df870c947685df2d",
    "zh:b919bf3ee8e3b01051a0da3433b443a925e272893d3724ee8fc0f666ec7012c9",
    "zh:d13b81ea6755cae785b3e11634936cdff2dc1ec009dc9610d8e3c7eb32f42e69",
    "zh:f1c9d2eb1a6b618ae77ad86649679241bd8d6aacec06d0a68d86f748687f4eb3",
  ]
}

provider "registry.opentofu.org/hashicorp/kubernetes" {
  version     = "3.0.1"
  constraints = ">= 2.20.0"
  hashes = [
    "h1:e0dSpTDhKjin6KYIwLWTR+AHVC7wWlU3VfIx27n1bec=",
    "zh:0a6aff192781cfd062efe814d87ec21c84273005a685c818fb3c771ec9fd7051",
    "zh:129f10760e8c727f7b593111e0026aa36aeb28c98f6500c749007aabba402332",
    "zh:4a0995010f32949b1fbe580db15e76c73ba15aa265f73a7e535addd15dfade0d",
    "zh:8b518be59029e8f0ad0767dbbd87f169ac6c906e50636314f8a5ff3c952f0ad5",
    "zh:a2f1c113ae07dc5da8410d7a93b7e9ad24c3f17db357f090e6d68b41ed52e616",
    "zh:b1d3604a2f545beae0965305d7bca821076cc9127fc34a77eef01c2d0cf916d2",
    "zh:c2f2d371018d77affce46fee8b9a9ff0d27c4d5c3c64f8bce654e7c8d3305dc1",
    "zh:c7cf958fb9bb429086ff1d371a4b824ec601ec0913dddaf85cd2e38d73ca7ec0",
    "zh:f7753278388598c8e27140c5700e5699a0131926df8dad362f86ad67c36585ea",
  ]
}

provider "registry.opentofu.org/hashicorp/null" {
  version     = "3.2.4"
  constraints = ">= 3.0.0"
  hashes = [
    "h1:i+WKhUHL2REY5EGmiHjfUljJB8UKZ9QdhdM5uTeUhC4=",
    "zh:1769783386610bed8bb1e861a119fe25058be41895e3996d9216dd6bb8a7aee3",
    "zh:32c62a9387ad0b861b5262b41c5e9ed6e940eda729c2a0e58100e6629af27ddb",
    "zh:339bf8c2f9733fce068eb6d5612701144c752425cebeafab36563a16be460fb2",
    "zh:36731f23343aee12a7e078067a98644c0126714c4fe9ac930eecb0f2361788c4",
    "zh:3d106c7e32a929e2843f732625a582e562ff09120021e510a51a6f5d01175b8d",
    "zh:74bcb3567708171ad83b234b92c9d63ab441ef882b770b0210c2b14fdbe3b1b6",
    "zh:90b55bdbffa35df9204282251059e62c178b0ac7035958b93a647839643c0072",
    "zh:ae24c0e5adc692b8f94cb23a000f91a316070fdc19418578dcf2134ff57cf447",
    "zh:b5c10d4ad860c4c21273203d1de6d2f0286845edf1c64319fa2362df526b5f58",
    "zh:e05bbd88e82e1d6234988c85db62fd66f11502645838fff594a2ec25352ecd80",
  ]
}

provider "registry.opentofu.org/hashicorp/time" {
  version     = "0.13.1"
  constraints = ">= 0.9.0"
  hashes = [
    "h1:3X1jTAlLJV6G9AylC+BgX7WrKFcZYHqA+Z4JwB+v7as=",
    "zh:10f32af8b544a039f19abd546e345d056a55cb7bdd69d5bbd7322cbc86883848",
    "zh:35dd5beb34a9f73de8d0fed332814c69acae69397c9c065ce63ccd8315442bef",
    "zh:56545d1dd5f2e7262e0c0c124264974229ec9cc234d0d7a0e36e14b869590f4a",
    "zh:8d7259c3f819fd3470ff933c904b6a549502a8351feb1b5c040a4560decaf7e0",
    "zh:a40f26878826b142e26fe193f7e3e14fc97f615cd6af140e88ce5bc25f3fcf50",
    "zh:b2e82f25fecff172a9a9e24ea37d37e4fc630ee9245617cb40b10e66a6b979c8",
    "zh:d4b699850a40ed07ef83c6b827605d24050b2732646ee017bda278e4ddf01c91",
    "zh:e4e6a5e5614b6a54557400aabb748ebd57e947cdbd21ad1c7602c51368a80559",
    "zh:eb78fb97bca22931e730487a20a90f5a6221ddfb3138aaf070737ea2b7c9c885",
    "zh:faba366a1352ee679bba2a5b09c073c6854721db94b191d49b620b60946a065f",
  ]
}

provider "registry.opentofu.org/hashicorp/tls" {
  version     = "4.2.1"
  constraints = ">= 4.0.0"
  hashes = [
    "h1:ZilRQg3gaNxvWpwnrjV3ZyU4dXI0yQfgsxu2swX9E14=",
    "zh:0435b85c1aa6ac9892e88d99eaae0b1712764b236bf469c114c6ff4377b113d6",
    "zh:3413d6c61a6a1db2466200832e1d86b2992b81866683b1b946e7e25d99e8daf9",
    "zh:4e7610d4c05fee00994b851bc5ade704ae103d56f28b84dedae7ccab2148cc3f",
    "zh:5d7d29342992c202f748ff72dcaa1fa483d692855e57b87b743162eaf12b729a",
    "zh:7db84d143330fcc1f6f2e79b9c7cc74fdb4ddfe78d10318d060723d6affb8a5c",
    "zh:b7fb825fd0eccf0ea9afb46627d2ec217d2d99a5532de8bcbdfaa0992d0248e2",
    "zh:cb8ca2de5f7367d987a23f88c76d80480bcc49da8bdc3fd24dd9b19d3428d72d",
    "zh:eb88588123dd53175463856d4e2323fb0da44bdcf710ec34f2cad6737475638b",
    "zh:f92baceb82d3a1e5b6a34a29c605b54cae8c6b09ea1fffb0af4d036337036a8f",
  ]
}
