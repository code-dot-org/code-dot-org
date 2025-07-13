'use client';

import useResizeObserver from '@react-hook/resize-observer';
import {SplitPane} from '@rexxars/react-split-pane';
import React, {useRef, useEffect, useState, useCallback} from 'react';

import {Heading1} from '@code-dot-org/component-library/typography';

import type {LevelData} from '@/app/models/level';

import DATA from '../data';
import FrequencyLevelProvider from '../providers/FrequencyLevelProvider';
import {FrequencyData} from '../types';

import Controls from './Controls';
import Graph from './Graph';
import Letters from './Letters';
import MessagePanel from './MessagePanel';

import moduleStyles from './frequencyLevel.module.scss';

export interface FrequencyLevelData {
  /** Which cipher type to show */
  mode: 'caesar' | 'substitution';
  /** The different messages to choose from to display */
  messages: FrequencyMessageData[];
}

export interface FrequencyLevelProps {
  level: LevelData;
}

/**
 * Provides the full layout of the Frequency widget level.
 *
 * The frequency level investigates substitution ciphers to demonstrate
 * symmetric encryption and the inherent weaknesses of such an approach.
 */
const FrequencyLevel: React.FunctionComponent<FrequencyLevelProps> = () => {
  const locale = 'es';
  const graphPlaneRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number>(0);
  const frequencyData = useRef<FrequencyData>({
    alphabetical: DATA[locale].map(item => item.letter),
    letters: DATA[locale].map(item => item.letter),
    sourceLetters: DATA[locale].map(item => item.letter),
    sourceData: DATA[locale].slice(),
    data: DATA[locale].map(item => ({
      ...item,
      frequency: Math.random() / 5,
    })),
    cipher: new Map<string, string>(),
    positions: [],
  });
  const mode = 'ccaesar';

  const messages = [
    {
      title: 'Unencrypted Sample',
      answer: 'none',
      message:
        "Here is a plain text message that hasn't been encrypted at all. You can click the buttons below to experiment with the frequency analysis and random substitution tools. Try clicking all the buttons - sort the substitutions in different ways. What's the most frequently occurring letter? Once you have a sense for what's happening, try to crack a random substitution cipher!",
    },
    {
      title: 'Encrypted Sample 1',
      answer:
        "Hitchhiker's guide to the galaxy - Far out in the uncharted backwaters of the unfashionable...",
      message:
        "Npd ulk vy krg lycrpdkgj epctopkgda un krg lynparvuypebg gyj un krg ogakgdy aqvdpb pds un krg Mpbpfi bvga p aspbb lydgmpdjgj igbbuo aly. Udevkvym krva pk p jvakpycg un dulmrbi yvygki-kou svbbvuy svbga va py lkkgdbi vyavmyvnvcpyk bvkkbg eblg mdggy qbpygk oruag pqg-jgacgyjgj bvng nudsa pdg au pspzvymbi qdvsvkvwg krpk krgi akvbb krvyt jvmvkpb opkcrga pdg p qdgkki ygpk vjgp. Krva qbpygk rpa - ud dpkrgd rpj - p qduebgs, orvcr opa krva: suak un krg qguqbg uy vk ogdg lyrpqqi nud qdgkki slcr un krg kvsg. Spyi aublkvuya ogdg almmgakgj nud krva qduebgs, elk suak un krgag ogdg bpdmgbi cuycgdygj ovkr krg suwgsgyka un aspbb mdggy qvgcga un qpqgd, orvcr va ujj egcplag uy krg orubg vk opay'k krg aspbb mdggy qvgcga un qpqgd krpk ogdg lyrpqqi. Pyj au krg qduebgs dgspvygj; buka un krg qguqbg ogdg sgpy, pyj suak un krgs ogdg svagdpebg, gwgy krg uyga ovkr jvmvkpb opkcrga. Spyi ogdg vycdgpavymbi un krg uqvyvuy krpk krgi'j pbb spjg p evm svakptg vy cusvym juoy ndus krg kdgga vy krg nvdak qbpcg. Pyj ausg apvj krpk gwgy krg kdgga rpj eggy p epj suwg, pyj krpk yu uyg arulbj gwgd rpwg bgnk krg ucgpya. Pyj krgy, uyg Krldajpi, ygpdbi kou krulapyj igpda pnkgd uyg spy rpj eggy ypvbgj ku p kdgg nud apivym ruo mdgpk vk oulbj eg ku eg yvcg ku qguqbg nud p crpymg, uyg mvdb avkkvym uy rgd uoy vy p aspbb cpng vy Dvctspyaoudkr aljjgybi dgpbvzgj orpk vk opa krpk rpj eggy muvym oduym pbb krva kvsg, pyj arg nvypbbi tygo ruo krg oudbj culbj eg spjg p muuj pyj rpqqi qbpcg. Krva kvsg vk opa dvmrk, vk oulbj oudt, pyj yu uyg oulbj rpwg ku mgk ypvbgj ku pyikrvym. Apjbi, ruogwgd, egnudg arg culbj mgk ku p qruyg ku kgbb pyiuyg peulk vk, p kgddvebi aklqvj cpkpakduqrg ucclddgj, pyj krg vjgp opa buak nudgwgd. Krva va yuk rgd akudi. Elk vk va krg akudi un krpk kgddvebg aklqvj cpkpakduqrg pyj ausg un vka cuyagxlgycga. Vk va pbau krg akudi un p euut, p euut cpbbgj Krg Rvkcr Rvtgd'a Mlvjg ku krg Mpbpfi - yuk py Gpdkr euut, ygwgd qlebvargj uy Gpdkr, pyj lykvb krg kgddvebg cpkpakduqrg ucclddgj, ygwgd aggy ud rgpdj un ei pyi Gpdkrspy. Ygwgdkrgbgaa, p orubbi dgspdtpebg euut",
    },
    {
      title: 'Encrypted Sample 2',
      answer: 'Aloe Black song - Feeling my way through the darkness...',
      message:
        "Tjjycug fi hzi vexmsge vej ozxqujrr. Gscojo di z djzvcug ejzxv. C bzu'v vjyy hejxj vej kmsxuji hcyy juo. Dsv C qumh hejxj vm rvzxv. Veji vjyy fj C'f vmm imsug vm suojxrvzuo. Veji rzi C'f bzsgev sw cu z oxjzf. Hjyy yctj hcyy wzrr fj di ct C omu'v mwju sw fi jijr. Hjyy vezv'r tcuj di fj. Rm hzqj fj sw heju cv'r zyy majx. Heju C'f hcrjx zuo C'f myojx. Zyy vecr vcfj C hzr tcuocug firjyt. Zuo C ocou'v qumh C hzr ymrv. Rm hzqj fj sw heju cv'r zyy majx. Heju C'f hcrjx zuo C'f myojx. Zyy vecr vcfj C hzr tcuocug firjyt. Zuo C ocou'v qumh C hzr ymrv. C vxcjo bzxxicug vej hjcgev mt vej hmxyo. Dsv C muyi ezaj vhm ezuor. Emwj C gjv vej bezubj vm vxzajy vej hmxyo. Dsv C omu'v ezaj zui wyzur. Hcre vezv C bmsyo rvzi tmxjajx vecr imsug. Umv ztxzco vm bymrj fi jijr. Yctj'r z gzfj fzoj tmx jajximuj. Zuo ymaj cr vej wxcnj. Rm hzqj fj sw heju cv'r zyy majx Heju C'f hcrjx zuo C'f myojx. Zyy vecr vcfj C hzr tcuocug firjyt Zuo C ocou'v qumh C hzr ymrv. Rm hzqj fj sw heju cv'r zyy majx. Heju C'f hcrjx zuo C'f myojx. Zyy vecr vcfj C hzr tcuocug firjyt. Zuo C ocou'v qumh C hzr ymrv.",
    },
    {
      title: 'Encrypted Sample 3',
      answer: 'Gettysburg Address -- Four score and seven years ago...',
      message:
        'Cxfi vkxin had vnlna mnhiv hgx xfi chztniv wixfgtz cxizt xa ztrv kxazranaz h anj ahzrxa, kxaknrlnd ra erwnizm had dndrkhznd zx ztn sixsxvrzrxa zthz hee una hin kinhznd nqfhe. Axj jn hin naghgnd ra h ginhz krlre jhi, znvzrag jtnztni zthz ahzrxa xi ham ahzrxa vx kxaknrlnd had vx dndrkhznd kha exag nadfin. Jn hin unz xa h ginhz whzzencrned xc zthz jhi. Jn thln kxun zx dndrkhzn h sxizrxa xc zthz crned hv h crahe invzrag-sehkn cxi ztxvn jtx tnin ghln ztnri erlnv zthz zthz ahzrxa urgtz erln. Rz rv hezxgnztni crzzrag had sixsni zthz jn vtxfed dx ztrv. Wfz ra h ehigni vnavn, jn khaaxz dndrkhzn, jn khaaxz kxavnkihzn, jn khaaxz theexj ztrv gixfad. Ztn wihln una, erlrag had dnhd jtx vzifggend tnin thln kxavnkihznd rz chi hwxln xfi sxxi sxjni zx hdd xi dnzihkz. Ztn jxied jree erzzen axzn axi exag inunuwni jthz jn vhm tnin, wfz rz kha anlni cxignz jthz ztnm drd tnin. Rz rv cxi fv ztn erlrag ihztni zx wn dndrkhznd tnin zx ztn facrarvtnd jxip jtrkt ztnm jtx cxfgtz tnin thln ztfv chi vx axwem hdlhaknd. Rz rv ihztni cxi fv zx wn tnin dndrkhznd zx ztn ginhz zhvp inuhrarag wncxin fv--zthz cixu ztnvn txaxind dnhd jn zhpn rakinhvnd dnlxzrxa zx zthz khfvn cxi jtrkt ztnm ghln ztn ehvz cfee unhvfin xc dnlxzrxa--zthz jn tnin trgtem invxeln zthz ztnvn dnhd vthee axz thln drnd ra lhra, zthz ztrv ahzrxa fadni Gxd vthee thln h anj wrizt xc cinndxu, had zthz gxlniaunaz xc ztn snxsen, wm ztn snxsen, cxi ztn snxsen vthee axz snirvt cixu ztn nhizt.',
    },
    {
      title: 'Encrypted Sample 4',
      answer:
        "I'm Happy Lyrics -- It might seem crazy what I'm about to say...",
      message:
        "Rn mrtyn deem qawcz bywn R'm wluvn nu dwz Dvhdyrhe dye'd yeae, zuv qwh nwke wbwz R'm w yun wra lwiiuuh, R quvij tu nu dfwqe Brny nye wra, irke R juh'n qwae lwlz lz nye bwz Leqwvde R'm ywffz Qiwf wiuht ro zuv oeei irke w auum brnyuvn w auuo Leqwvde R'm ywffz Qiwf wiuht ro zuv oeei irke ywffrhedd rd nye navny Leqwvde R'm ywffz Qiwf wiuht ro zuv khub bywn ywffrhedd rd nu zuv Leqwvde R'm ywffz Qiwf wiuht ro zuv oeei irke nywn'd bywn zuv bwhhw ju Yeae qume lwj hebd nwikrht nyrd whj nywn Zewy, trge me wii zuv tun, juh'n yuij lwqk Zewy, beii R dyuvij faulwliz bwah zuv R'ii le xvdn orhe Zewy, hu uooehde nu zuv juh'n bwdne zuva nrme Yeae'd byz Ywffz, larht me jubh Qwh'n hunyrht, larht me jubh Iuge rd nuu ywffz nu larht me jubh Qwh'n hunyrht, larht me jubh R dwrj larht me jubh Qwh'n hunyrht, larht me jubh Iuge rd nuu ywffz nu larht me jubh Qwh'n hunyrht, larht me jubh R dwrj",
    },
    {
      title: 'Encrypted Sample 5',
      answer: 'I Have a Dream speech -- so even though we face...',
      message:
        "Fa tstb vzaedz ut mcpt vzt lrmmrpeivrtf am valcx cbl vakannau R fvrii zcst c lntck. Rv rf c lntck lttwix naavtl rb vzt Cktnrpcb lntck. R zcst c lntck vzcv abt lcx vzrf bcvrab urii nrft ew cbl irst aev vzt vnet ktcbrbd am rvf pnttl: 'Ut zail vztft vnevzf va ot ftim-tsrltbv; vzcv cii ktb cnt pntcvtl tjeci.’ R zcst c lntck vzcv abt lcx ab vzt ntl zriif am Dtandrc vzt fabf am manktn ficstf cbl vzt fabf am manktn ficst aubtnf urii ot coit va frv vadtvztn cv vzt vcoit am onavztnzaal. R zcst c lntck vzcv abt lcx tstb vzt fvcvt am Krffrffrwwr, c fvcvt futivtnrbd urvz vzt ztcv am rbyefvrpt, futivtnrbd urvz vzt ztcv am awwntffrab, urii ot vncbfmanktl rbva cb acfrf am mnttlak cbl yefvrpt. R zcst c lntck vzcv irvvit pzrilntb urii abt lcx irst rb c bcvrab uztnt vztx urii bav ot yeldtl ox vzt paian am vztrn fqrb oev ox vzt pabvtbv am vztrn pzcncpvtn. R zcst c lntck valcx. R zcst c lntck vzcv abt lcx laub rb Cicockc, urvz rvf srpraef ncprfvf, urvz rvf Dastnban zcsrbd zrf irwf lnrwwrbd urvz vzt uanlf am rbvtnwafrvrab cbl beiirmrpcvrab, abt lcx nrdzv vztnt rb Cicockc irvvit oicpq oaxf cbl oicpq drnif urii ot coit va yarb zcblf urvz irvvit uzrvt oaxf cbl uzrvt drnif cf frfvtnf cbl onavztnf. R zcst c lntck valcx. R zcst c lntck vzcv abt lcx tstnx sciitx fzcii ot thcivtl, tstnx zrii cbl kaebvcrb fzcii ot kclt iau, vzt naedz wicptf wicrbf, cbl vzt pnaaqtl wicptf urii ot kclt fvncrdzv, cbl otmant vzt Ianl urii ot ntstcitl, cbl cii mitfz fzcii ftt rv vadtvztn. Vzrf rf aen zawt. Vzrf rf vzt mcrvz vzcv R da ocpq va vzt kaebv urvz. Urvz vzrf mcrvz ut urii ot coit va ztu aev am vzt kaebvcrb am ltfwcrn c fvabt am zawt. Urvz vzrf mcrvz ut urii ot coit va vncbfmank vzt dtberbt lrfpanlf am aen bcvrab rbva c otcevrmei fxkwzabx am onavztnzaal. Urvz vzrf mcrvz ut urii ot coit va uanq vadtvztn, wncx vadtvztn; va fvneddit vadtvztn, va da va ycri vadtvztn, va fvcbl ew man mnttlak mantstn, qbaurbd vzcv ut urii ot mntt abt lcx. Cbl R fcx va xae valcx kx mnrtblf, itv mnttlak nrbd. Mnak vzt wnalrdraef zriivawf am Btu Zckwfzrnt, itv mnttlak nrbd. Mnak vzt krdzvx kaebvcrbf am Btu Xanq, itv mnttlak nrbd. Mnak vzt krdzvx Ciitdztbrtf am Wtbbfxiscbrc! Itv mnttlak nrbd mnak vzt fbau pcwwtl Napqrtf am Paiancla! Itv mnttlak nrbd mnak vzt penscptaef fiawtf am Pcirmanbrc! Oev bav abix vztnt; itv mnttlak nrbd mnak vzt Fvabt Kaebvcrb am Dtandrc! Itv mnttlak nrbd mnak Iaaqaev Kaebvcrb rb Vtbbtfftt! Itv mnttlak nrbd mnak tstnx zrii cbl kaitzrii rb Krffrffrwwr. Mnak tstnx kaebvcrbfrlt, itv mnttlak nrbd. Cbl uztb vzrf zcwwtbf, uztb ut ciiau mnttlak va nrbd, uztb ut itv rv nrbd mnak tstnx sriicdt cbl zckitv, mnak tstnx fvcvt cbl tstnx prvx, ut urii ot coit va fwttl ew vzcv lcx uztb cii am Dal'f pzrilntb, oicpq ktb cbl uzrvt ktb, Ytuf cbl Dtbvritf, Wnavtfvcbvf cbl Pcvzairpf, urii ot coit va yarb zcblf cbl frbd rb vzt uanlf am vzt ail Btdna fwrnrveci, 'Mntt cv icfv! Mntt cv icfv! Vzcbq Dal cikrdzvx, ut'nt mntt cv icfv!'",
    },
  ];

  const updaters = useRef<(() => void)[]>([]);

  const letters = frequencyData.current.letters;
  const [cipherState, setCipherState] = useState<string>(letters.join(''));
  const [data, setData] = useState(frequencyData.current.data);
  const [sourceData, setSourceData] = useState(
    frequencyData.current.sourceData,
  );
  const [assignedData, setAssignedData] = useState(
    frequencyData.current.sourceData.map(item => ({...item, frequency: 0})),
  );

  const onUpdate = useCallback(() => {
    updaters.current.forEach(updater => updater?.());
  }, [updaters]);

  useResizeObserver(graphPlaneRef, () => {
    if (mode === 'caesar') {
      repositionLetters();
    }
  });

  const repositionLetters = useCallback(() => {
    if (graphPlaneRef.current) {
      // There are no graphs, so we have to position the letters ourselves
      // In a graphed mode, the graph tells us where the letters are by looking
      // at the bars in the graph. In a mode without a graph, we just position them
      // in intervals.
      const width = graphPlaneRef.current.querySelector(
        `.${moduleStyles.graphPlaneContainer}`,
      ).clientWidth;
      const count = frequencyData.current.letters.length;
      const leftPadding = 100 + 10;
      const gap = (width - leftPadding - 20) / count;
      frequencyData.current.positions = frequencyData.current.letters.map(
        (_, i) => leftPadding + gap * i + gap / 2,
      );

      onUpdate();
    }
  }, [frequencyData, graphPlaneRef, onUpdate]);

  useEffect(() => {
    if (mode === 'caesar') {
      repositionLetters();
    }
  }, [mode, repositionLetters]);

  const updateCipher = useCallback(() => {
    // Update the cipher state. If that changes, it causes the message to re-render
    setCipherState(
      frequencyData.current.letters
        .map(letter => `${frequencyData.current.cipher.get(letter)}->${letter}`)
        .join(''),
    );

    // Form new graph data
    setData(
      frequencyData.current.letters.map(letter => ({
        letter,
        frequency:
          frequencyData.current.data.find(item => item.letter === letter)
            ?.frequency || 0,
      })),
    );

    setAssignedData(
      frequencyData.current.letters.map(letter => {
        const {cipher} = frequencyData.current;
        const frequency = cipher.has(letter)
          ? frequencyData.current.sourceData.find(
              item => item.letter === cipher.get(letter),
            )?.frequency || 0
          : 0;

        return {
          letter,
          frequency,
        };
      }),
    );

    const newSourceData = frequencyData.current.sourceLetters.map(letter => {
      const {cipher} = frequencyData.current;
      const mapped = frequencyData.current.letters.find(
        mapped => cipher.has(mapped) && cipher.get(mapped) === letter,
      );
      const frequency = mapped
        ? 0
        : frequencyData.current.sourceData.find(item => item.letter === letter)
            ?.frequency || 0;

      return {
        letter,
        frequency,
      };
    });
    setSourceData(newSourceData);

    onUpdate();
  }, [
    setCipherState,
    setData,
    setAssignedData,
    setSourceData,
    frequencyData,
    onUpdate,
  ]);

  const isMapped: (a: string) => boolean = useCallback((a: string) => {
    const {cipher, letters} = frequencyData.current;
    return !!letters.find(
      mapped => cipher.has(mapped) && cipher.get(mapped) === a,
    );
  }, []);

  const unmapLetter = useCallback(
    (a: string) => {
      const {cipher} = frequencyData.current;

      // Remove 'A'
      cipher.delete(a);
      // Remove 'a'
      cipher.delete(a.toLowerCase());
      // Remove 'a' with a diacritic
    },
    [frequencyData],
  );

  const clearMapping = useCallback(
    (a: string) => {
      const {cipher} = frequencyData.current;

      const mapped = letters.find(
        mapped => cipher.has(mapped) && cipher.get(mapped) === a,
      );

      if (mapped) {
        cipher.delete(mapped);
        cipher.delete(mapped.toLowerCase());
      }
    },
    [frequencyData],
  );

  /**
   * Maps the given letter a to the cipher letter b (or remove
   * the mapping if b is omitted or undefined).
   *
   * If cipher letter b already exists, it will swap it with
   * whatever cipher letter was already attached to a.
   */
  const mapLetter = useCallback(
    (a: string, b?: string) => {
      const {cipher} = frequencyData.current;

      // Delete any potential mapping to 'b' already
      if (b) {
        clearMapping(b);
      }

      // Set it
      if (b) {
        cipher.set(a, b);
        cipher.set(a.toLowerCase(), b.toLowerCase());
      } else {
        unmapLetter(a);
      }
    },
    [frequencyData, clearMapping, unmapLetter],
  );

  const swapMapping = useCallback(
    (a: string, b: string) => {
      const {cipher} = frequencyData.current;

      // Swap them
      const mapped = letters.find(
        mapped => cipher.has(mapped) && cipher.get(mapped) === a,
      );
      const mappedTo = letters.find(
        mapped => cipher.has(mapped) && cipher.get(mapped) === b,
      );

      if (mapped) {
        // Set the base mapping
        mapLetter(mapped, b);
      }

      // Also, perform the swap the other way, if necessary
      if (mappedTo) {
        mapLetter(mappedTo, a);
      }
    },
    [frequencyData, mapLetter],
  );

  return (
    <div className={moduleStyles.frequencyLevel}>
      <FrequencyLevelProvider
        mapLetter={mapLetter}
        swapMapping={swapMapping}
        clearMapping={clearMapping}
        isMapped={isMapped}
      >
        <SplitPane
          className={moduleStyles.split}
          split="vertical"
          defaultSize={400}
          allowResize
          paneClassName={moduleStyles.splitPane}
          resizerClassName={moduleStyles.resizerVertical}
          onChange={() => {
            // Disable the letter movement during the drag
            if (graphPlaneRef.current) {
              graphPlaneRef.current.style.overflowX = 'hidden';
              for (const el of graphPlaneRef.current.querySelectorAll(
                `.${moduleStyles.letters}`,
              )) {
                el.classList.remove(moduleStyles.animate);
              }

              if (timerRef.current !== 0) {
                clearTimeout(timerRef.current);
              }

              timerRef.current = setTimeout(() => {
                graphPlaneRef.current.style.overflowX = '';
                for (const el of graphPlaneRef.current.querySelectorAll(
                  `.${moduleStyles.letters}`,
                )) {
                  el.classList.add(moduleStyles.animate);
                }
              }, 200);
            }
          }}
        >
          <MessagePanel
            messages={messages}
            state={cipherState}
            frequencyData={frequencyData}
            onUpdate={updateCipher}
          />
          <div className={moduleStyles.plotPane}>
            <Heading1 visualAppearance="heading-sm">
              Letter Frequencies
            </Heading1>
            <div className={moduleStyles.graphPlane} ref={graphPlaneRef}>
              <div
                className={moduleStyles.graphPlaneContainer}
                style={{
                  minWidth: `${100 + 10 + 30 * frequencyData.current.alphabetical.length}px`,
                }}
              >
                {mode !== 'caesar' && (
                  <Graph
                    frequencyData={frequencyData}
                    data={data}
                    sourceData={assignedData}
                    onUpdate={onUpdate}
                    color={'#6666ff'}
                  />
                )}
                <Letters
                  frequencyData={frequencyData}
                  setUpdater={updater => {
                    updaters.current[0] = updater;
                  }}
                  caption="Original"
                />
                <Letters
                  frequencyData={frequencyData}
                  setUpdater={updater => {
                    updaters.current[1] = updater;
                  }}
                  interactive
                  caption="Maps to"
                  onUpdate={updateCipher}
                />
                <Letters
                  frequencyData={frequencyData}
                  setUpdater={updater => {
                    updaters.current[2] = updater;
                  }}
                  interactive
                  isSource
                  caption="Unassigned"
                  onUpdate={updateCipher}
                />
                {mode !== 'caesar' && (
                  <Graph
                    frequencyData={frequencyData}
                    sourceData={sourceData}
                    inverted
                  />
                )}
              </div>
            </div>
            <Controls frequencyData={frequencyData} onUpdate={updateCipher} />
          </div>
        </SplitPane>
      </FrequencyLevelProvider>
    </div>
  );
};

export default FrequencyLevel;
