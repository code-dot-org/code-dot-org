import testImageAccess from '../code-studio/url_test';
import trackEvent from '../util/trackEvent';

export async function measureVideoConnectivity() {
  const providers = {
    vc: "https://videos.code.org/retrieval-test.ico",
    yt: "https://www.youtube.com/favicon.ico",
    yc: "https://www.youtube-nocookie.com/favicon.ico",
    pn: "https://code.hosted.panopto.com/Panopto/Styles/Less/Application/Images/Header/panopto_logo_20px.png",
    gv: "https://r4---sn-nx57yn7r.googlevideo.com/videoplayback?gir=yes&sparams=aitags%2Cclen%2Cdur%2Cei%2Cgir%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Ckeepalive%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Crequiressl%2Csource%2Cexpire&requiressl=yes&key=yt6&clen=8513916&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278&keepalive=yes&itag=243&mn=sn-nx57yn7r%2Csn-n4v7sn7y&ipbits=0&mm=31%2C26&signature=5F12F8ECC015B1BBF1314C7B94B3C7D77115E2FC.DCD0C618DD3968CB61ACEE9942FE5876106C058C&ms=au%2Conr&mime=video%2Fwebm&mv=m&ip=74.85.95.106&source=youtube&pl=23&id=o-AAqtBFx1SzRlN-xW_Gl3yVmt70wbF8wgAa9tEV3cpVV9&initcwndbps=1480000&fvip=1&dur=343.593&ei=RjTWWoPpCsmO_AOylZX4Aw&c=WEB_EMBEDDED_PLAYER&lmt=1521443391060229&mt=1523987444&expire=1524009126&alr=yes&cpn=hCDrr3hqWTtnlkjC&cver=20180413&range=0-98103&rn=0&rbuf=0",
    cf: "https://d2y36twrtb17ty.cloudfront.net/favicon.ico",
    yi: "https://s.ytimg.com/yt/img/email/digest/email_header.png"
  };

  const values = await Promise.all(
    Object.keys(providers).map(key => {
      return new Promise(function (resolve, _) {
        testImageAccess(
          providers[key] + "?" + Math.random(),
          () => resolve(key),
          () => resolve(null),
          10000,        // 10 seconds.
          key === "gv"   // "gv" is a video element, not an image.
        );
      });
    })
  );

  const filteredValues = values.filter(n => n);   // Remove null entries.
  filteredValues.sort();
  const comboString = filteredValues.join("-");
  trackEvent("Research", "VideoSiteAccessibility", comboString);
}
