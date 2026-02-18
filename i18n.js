// i18n translation system
const translations = {
    ja: {
        // Hero
        'hero.tagline': 'コミュニティとともに<br class="sp-only">物語を紡ぐ',
        'hero.subtitle': '「フルAIアニメ」特化型スタジオ',
        'hero.cta': 'View Works',

        // Philosophy
        'philosophy.subtitle': 'Our Core Value',
        'philosophy.quote': '「AIじゃできない」を嘆くな<br />「AIでできること」を極めろ',
        'philosophy.text': '<strong>「AIアニメ」は完璧ではありません。</strong><br><br>技術的な制約は多く、商業レベルの作品を作るのは困難です。<br><br>しかし。<br><br>私たちは「今のAIではできないこと」を数えるのではなく、<br>今ある技術で最高峰のエンターテインメントを創り出したいと考えています。<br><br>それがStudio VIBEの在り方です。',

        // Strengths
        'strengths.subtitle': '私たちの強み',
        'strengths.lead': '<strong>Studio VIBEの強みは、2021年から培っている「クリエイターコミュニティ」にあります。</strong>',
        'strengths.p1': '私たちのオリジナルIP「クリプトニンジャ」は、ファンアートクリエイターに対して「無許諾での商用利用」を許可する特異なライセンスを提供しています（<a href="https://note.com/ihayato/n/ne2d4454ad816" target="_blank">ガイドライン</a>）。',
        'strengths.p2': 'これまでも、多くのクリエイターがクリプトニンジャを活用し、収益化に成功しています。',
        'strengths.p3': '公式として「AI読み込み可能なイラスト素材」も提供し、こちらも多くのファン、クリエイターに利活用いただいています。',
        'strengths.salon': 'また、Studio VIBEが主宰する「AIクリエイティブサロン[<a href="https://aimusic.salon/" target="_blank">https://aimusic.salon/</a>]」は、2000人以上の参加者が集まる業界最大手のコミュニティとなっています。',
        'strengths.p4': '私たちは、AIは一部のプロのものではなく、「クリエイティブの民主化」を実現するツールだと確信しています。',

        // Works
        'works.subtitle': 'Recent Creations',
        'works.slide_bluecat.title': '短編アニメ「ニンジャ犯科帳『幸せの青い猫』」',
        'works.slide_bluecat.desc': '2026年2月公開。チーム制作2作目となる作品。公開時点でおそらく世界最長のフルAI短編ジャパニメーション作品です。',
        'works.slide1.title': '短編アニメ「ニンジャ犯科帳『強さの秘訣』」',
        'works.slide1.desc': '2026年1月公開。DaVinci Resolveを活用した、初のチーム制作作品。',
        'works.slide2.title': 'フルAIミュージックビデオ「クォ・ヴァディス」',
        'works.slide2.desc': '2025年9月公開。Nano Bananaリリース直後から制作を開始。<br>国内ではもっとも早いNano Bananaを駆使したフルアニメMVです。',
        'works.slide3.title': '短編アニメ「ニンジャ犯科帳『こわいまんじゅう』」',
        'works.slide3.desc': '2025年11月公開。おそらく世界初の10分尺の、フルAIジャパニメーション。<br>スタジオ代表イケハヤがMacBook Air（M2）1台で、37時間掛けて制作。',
        'works.slide4.title': '実写風MV「アンダルシアの犬」',
        'works.slide4.desc': '2025年10月公開。パブリックドメインの名画「アンダルシアの犬」をオマージュしたミュージックビデオ。制作時間は8時間。',

        // Business - IP
        'biz.ip.title': '自社IP育成',
        'biz.ip.h3': 'Original Characters & Story',
        'biz.ip.desc': 'オリジナルIP「クリプトニンジャ」を中心とした、ストーリーアニメの開発。<br>AIを活用したスピーディーなアニメ制作を実現します。',
        'biz.ip.detail': 'Web3時代から構築を続ける強固なコミュニティ「Ninja DAO」を基盤に、AIをフル活用してアニメ、ゲーム、マンガ、イラストなどを展開中。',
        'biz.ip.btn': 'YouTubeで作品を見る',

        // Business - Education
        'biz.edu.title': '教育・コミュニティ',
        'biz.edu.h3': 'Creator Community',
        'biz.edu.desc': 'AIクリエイターの育成とコミュニティ運営。<br>次世代の才能を発掘します。',
        'biz.edu.detail': '2000人以上が参加する「<a href="https://aimusic.salon/" target="_blank">AIクリエイティブサロン</a>」、1500部以上の販売実績がある「<a href="https://brain-market.com/u/ikehaya/a/byMzMwMjMgoTZsNWa0JXY" target="_blank">AIアニメの教科書</a>」などを通して、最新のAIアニメ制作技術を共有する取り組みを行っています。<br>共に学び、成長するエコシステムを提供し、新たなクリエイターを輩出します。',
        'biz.edu.btn': 'AIアニメの教科書を購入する',

        // Business - Marketing
        'biz.mkt.title': 'マーケティング企画',
        'biz.mkt.h3': 'Viral Marketing',
        'biz.mkt.desc': 'SNSを中心としたバイラルマーケティング。<br>AIコンテンツを活用したPR戦略。',
        'biz.mkt.detail': 'AI動画・AIアニメを活用したマーケティング企画の実施をサポート。<br>代表のアカウント（<a href="https://x.com/IHayato" target="_blank">@IHayato</a>）を用いたインフルエンサーマーケティング、そしてコミュニティメンバーを巻き込んだUGCキャンペーンに強みがあります。',
        'biz.mkt.detail2': '過去の実績：「<a href="https://x.com/IHayato/status/2020694085347266859" target="_blank">AI魔法コンテスト</a>」(株式会社TORICO）',

        // Business - Consulting
        'biz.csl.title': '研修・コンサルティング',
        'biz.csl.h3': 'AI Implementation Support',
        'biz.csl.desc': 'AIアニメにまつわるコンサルティング、研修を実施。<br>最新のAIアニメ制作ノウハウをご提供します。',
        'biz.csl.detail': '既存の制作フローにおけるAI活用の可能性、AIアニメ新規事業開発などをサポート。<br>ワークショップ、研修や講演も承っております。',
        'biz.csl.detail2': '実績：「<a href="https://www.youtube.com/watch?v=RidYmq1QoE0" target="_blank">AIご当地ソングワークショップ</a>」（佐治DAO）',

        // Team
        'team.subtitle': 'Who We Are',

        // TV Animation
        'tv.subtitle': 'テレビアニメ制作実績',
        'tv.title': 'テレビアニメ「忍ばない！クリプトニンジャ咲耶」（1〜3期）',
        'tv.meta': '制作：ファンワークス ／ 原作：イケハヤ',
        'tv.desc': 'Studio VIBE代表のイケハヤは、テレビアニメの制作経験もあります。<br>NFTを活用したクラウドファンディングで1億円以上を調達、現在3期まで放送しています。<br>制作は株式会社ファンワークス、AI不使用の作品となっております。',
        'tv.btn': 'テレビアニメを観る（Amazonプライム）',

        // Contact
        'contact.subtitle': 'Get in Touch',
        'contact.name': 'Name',
        'contact.email': 'Email',
        'contact.type': 'Inquiry Type',
        'contact.type.production': '制作依頼',
        'contact.type.speaking': '講演依頼',
        'contact.type.recruitment': '採用について',
        'contact.type.other': 'その他',
        'contact.message': 'Message',
        'contact.submit': 'Send Message',

        // Footer
        'footer.copy': '© 2026 Studio VIBE. All rights reserved.',

        // About page
        'about.hero.title': 'Company',
        'about.hero.subtitle': '会社概要',
        'about.company.name.label': '会社名',
        'about.company.name': '合同会社日本の田舎は資本主義のフロンティアだ',
        'about.company.rep.label': '代表',
        'about.company.rep': '池田勇人（イケハヤ）',
        'about.company.est.label': '設立',
        'about.company.est': '2016年',
        'about.company.biz.label': '事業内容',
        'about.company.biz': 'AIアニメーション制作<br>IP開発・プロデュース<br>AIクリエイター育成・コミュニティ運営<br>マーケティング企画<br>研修・コンサルティング',
        'about.founder.subtitle': '代表メッセージ',
        'about.founder.msg1': '「AIでアニメは作れない」——そんな声がまだ多かった頃から、ぼくたちは手を動かし続けてきました。',
        'about.founder.msg2': 'ブロガー、NFTプロデューサーとして活動するなかで、いつも考えていたのは「テクノロジーで表現の民主化はどこまで進むのか？」ということ。',
        'about.founder.msg3': '2021年にプロデュースした「CryptoNinja」は、Web3の力でIPの常識を塗り替えるプロジェクトでした。二次創作を全面解放し、コミュニティの力でキャラクターを育てる。その経験は、Studio VIBEの思想に直結しています。',
        'about.founder.msg4': 'そして2025年、AIの進化がアニメーション制作の景色を一変させました。',
        'about.founder.msg5': 'もちろん、AIは万能ではありません。技術的制約も多い。でも「できないこと」を数えるのではなく、「今できること」を極めれば、AIだけでも人の心を動かすアニメが作れる。ぼくたちはそう信じています。',
        'about.founder.msg6': 'MacBook Air 1台から始まった制作は、いまやチーム体制へと進化しました。世界最長のAIアニメを生み出し、2000人超のクリエイターコミュニティを運営し、企業との協業も広がっています。',
        'about.founder.msg7': '高知の山奥から、世界に届くアニメを。<br>Studio VIBEは、制約を武器に、物語を紡ぎ続けます。',
        'about.career.subtitle': '経歴',
        'about.career.2009': '早稲田大学政治経済学部卒業。半導体メーカー勤務を経て、ソーシャルメディアマーケティングの世界へ。',
        'about.career.2011': 'フリーランスとして独立。プロブロガーとしての活動を本格化。',
        'about.career.2014': '高知県へ移住。「まだ東京で消耗してるの？」が話題に。',
        'about.career.2016': '合同会社「日本の田舎は資本主義のフロンティアだ」設立。',
        'about.career.2021': 'NFTプロジェクト「CryptoNinja」をプロデュース。Web3時代のIP展開を牽引。',
        'about.career.2025': 'Studio VIBE始動。AIアニメスタジオとして本格的な制作活動を開始。',
    },

    en: {
        // Hero
        'hero.tagline': 'Weaving Stories<br class="sp-only"> with Community',
        'hero.subtitle': 'A Studio Specialized in "Full AI Animation"',
        'hero.cta': 'View Works',

        // Philosophy
        'philosophy.subtitle': 'Our Core Value',
        'philosophy.quote': 'Don\'t lament what AI can\'t do.<br />Master what AI can.',
        'philosophy.text': '<strong>"AI animation" is not perfect.</strong><br><br>There are many technical constraints, and creating commercially viable works is challenging.<br><br>However.<br><br>Rather than counting what today\'s AI cannot do,<br>we aim to create the finest entertainment with the technology available now.<br><br>That is what Studio VIBE is all about.',

        // Strengths
        'strengths.subtitle': 'Our Strengths',
        'strengths.lead': '<strong>Studio VIBE\'s strength lies in the "creator community" we have been building since 2021.</strong>',
        'strengths.p1': 'Our original IP "CryptoNinja" offers a unique license that allows fan art creators to use it commercially without permission (<a href="https://note.com/ihayato/n/ne2d4454ad816" target="_blank">Guidelines</a>).',
        'strengths.p2': 'Many creators have already leveraged CryptoNinja to successfully monetize their work.',
        'strengths.p3': 'We also officially provide "AI-loadable illustration assets," which are widely used by fans and creators alike.',
        'strengths.salon': 'Also, the "AI Creative Salon" [<a href="https://aimusic.salon/" target="_blank">https://aimusic.salon/</a>] presided over by Studio VIBE has become the industry\'s largest community with over 2,000 participants.',
        'strengths.p4': 'We are convinced that AI is not just a tool for a select few professionals, but a tool that realizes the "democratization of creativity."',

        // Works
        'works.subtitle': 'Recent Creations',
        'works.slide_bluecat.title': 'Short Anime "Ninja Hankachō: The Blue Cat of Happiness"',
        'works.slide_bluecat.desc': 'Released February 2026. The second team-produced work. At the time of release, likely the world\'s longest full AI Japanimation short film.',
        'works.slide1.title': 'Short Anime "Ninja Hankachō: The Secret of Strength"',
        'works.slide1.desc': 'Released January 2026. Our first team-produced work utilizing DaVinci Resolve.',
        'works.slide2.title': 'Full AI Music Video "Quo Vadis"',
        'works.slide2.desc': 'Released September 2025. Production began right after the Nano Banana release.<br>The earliest full anime MV in Japan leveraging Nano Banana.',
        'works.slide3.title': 'Short Anime "Ninja Hankachō: Scary Manjū"',
        'works.slide3.desc': 'Released November 2025. Likely the world\'s first 10-minute full AI Japanimation.<br>Produced by studio founder Ikehaya on a single MacBook Air (M2) over 37 hours.',
        'works.slide4.title': 'Live-Action Style MV "Un Chien Andalou"',
        'works.slide4.desc': 'Released October 2025. A music video paying homage to the public domain classic "Un Chien Andalou." Produced in just 8 hours.',

        // Business - IP
        'biz.ip.title': 'IP Development',
        'biz.ip.h3': 'Original Characters & Story',
        'biz.ip.desc': 'Development of story anime centered on our original IP "CryptoNinja."<br>Achieving rapid anime production with AI.',
        'biz.ip.detail': 'Built on the strong "Ninja DAO" community cultivated since the Web3 era, we fully leverage AI to develop anime, games, manga, illustrations and more.',
        'biz.ip.btn': 'Watch on YouTube',

        // Business - Education
        'biz.edu.title': 'Education & Community',
        'biz.edu.h3': 'Creator Community',
        'biz.edu.desc': 'Nurturing AI creators and community management.<br>Discovering the next generation of talent.',
        'biz.edu.detail': 'Through the "<a href="https://aimusic.salon/" target="_blank">AI Creative Salon</a>" with over 2,000 members, and the "<a href="https://brain-market.com/u/ikehaya/a/byMzMwMjMgoTZsNWa0JXY" target="_blank">AI Anime Textbook</a>" with over 1,500 copies sold, we share the latest AI anime production techniques.<br>We provide an ecosystem for learning and growth, nurturing new creators.',
        'biz.edu.btn': 'Get the AI Anime Textbook',

        // Business - Marketing
        'biz.mkt.title': 'Marketing',
        'biz.mkt.h3': 'Viral Marketing',
        'biz.mkt.desc': 'Social media-driven viral marketing.<br>PR strategies leveraging AI content.',
        'biz.mkt.detail': 'Supporting marketing campaigns using AI video and AI anime.<br>Our strengths include influencer marketing through our representative\'s account (<a href="https://x.com/IHayato" target="_blank">@IHayato</a>) and UGC campaigns involving community members.',
        'biz.mkt.detail2': 'Past work: "<a href="https://x.com/IHayato/status/2020694085347266859" target="_blank">AI Magic Contest</a>" (TORICO Inc.)',

        // Business - Consulting
        'biz.csl.title': 'Training & Consulting',
        'biz.csl.h3': 'AI Implementation Support',
        'biz.csl.desc': 'Consulting and training on AI anime production.<br>Providing cutting-edge AI anime production know-how.',
        'biz.csl.detail': 'Supporting AI utilization in existing production workflows and new AI anime business development.<br>We also offer workshops, training sessions and lectures.',
        'biz.csl.detail2': 'Past work: "<a href="https://www.youtube.com/watch?v=RidYmq1QoE0" target="_blank">AI Local Song Workshop</a>" (Saji DAO)',

        // Team
        'team.subtitle': 'Who We Are',

        // TV Animation
        'tv.subtitle': 'TV Anime Production',
        'tv.title': 'TV Anime "Shinobanai! CryptoNinja Sakuya" (Seasons 1-3)',
        'tv.meta': 'Production: FanWorks / Original Story: Ikehaya',
        'tv.desc': 'Studio VIBE founder Ikehaya has experience producing TV anime.<br>Raised over 100 million yen through NFT-based crowdfunding, currently airing through Season 3.<br>Produced by FanWorks Inc., this is a non-AI production.',
        'tv.btn': 'Watch on Amazon Prime',

        // Contact
        'contact.subtitle': 'Get in Touch',
        'contact.name': 'Name',
        'contact.email': 'Email',
        'contact.type': 'Inquiry Type',
        'contact.type.production': 'Production Request',
        'contact.type.speaking': 'Speaking Request',
        'contact.type.recruitment': 'Recruitment',
        'contact.type.other': 'Other',
        'contact.message': 'Message',
        'contact.submit': 'Send Message',

        // Footer
        'footer.copy': '© 2026 Studio VIBE. All rights reserved.',

        // About page
        'about.hero.title': 'Company',
        'about.hero.subtitle': 'Company Overview',
        'about.company.name.label': 'Company Name',
        'about.company.name': 'Nihon no Inaka wa Shihonshugi no Frontier da LLC',
        'about.company.rep.label': 'Representative',
        'about.company.rep': 'Hayato Ikeda (Ikehaya)',
        'about.company.est.label': 'Founded',
        'about.company.est': '2016',
        'about.company.biz.label': 'Business',
        'about.company.biz': 'AI Animation Production<br>IP Development & Producing<br>AI Creator Development & Community Management<br>Marketing Planning<br>Training & Consulting',
        'about.founder.subtitle': 'Founder Message',
        'about.founder.msg1': '"You can\'t make anime with AI" — even when such voices were still prevalent, we kept pushing forward with our hands.',
        'about.founder.msg2': 'While working as a blogger and NFT producer, I always wondered: "How far can technology democratize creative expression?"',
        'about.founder.msg3': '"CryptoNinja," which I produced in 2021, was a project that challenged the conventions of IP through the power of Web3. Opening up derivative works and growing characters through community power — that experience is directly connected to Studio VIBE\'s philosophy.',
        'about.founder.msg4': 'Then in 2025, the evolution of AI completely transformed the landscape of animation production.',
        'about.founder.msg5': 'Of course, AI is not omnipotent. There are many technical constraints. But rather than counting what can\'t be done, if we master what can be done now, we can create anime that moves hearts even with AI alone. That\'s what we believe.',
        'about.founder.msg6': 'What started with a single MacBook Air has now evolved into a team operation. We\'ve created the world\'s longest AI anime, run a community of over 2,000 creators, and our corporate collaborations continue to grow.',
        'about.founder.msg7': 'From the mountains of Kochi, anime that reaches the world.<br>Studio VIBE will continue turning constraints into stories.',
        'about.career.subtitle': 'Career',
        'about.career.2009': 'Graduated from Waseda University\'s School of Political Science and Economics. After working at a semiconductor manufacturer, entered the social media marketing field.',
        'about.career.2011': 'Became independent as a freelancer. Fully committed to professional blogging.',
        'about.career.2014': 'Relocated to Kochi Prefecture. "Are you still wasting your life in Tokyo?" became a viral topic.',
        'about.career.2016': 'Founded "Nihon no Inaka wa Shihonshugi no Frontier da" LLC.',
        'about.career.2021': 'Produced the NFT project "CryptoNinja." Led IP development in the Web3 era.',
        'about.career.2025': 'Launched Studio VIBE. Began full-scale production activities as an AI anime studio.',
    },
};

// Apply translations
function applyTranslation(lang) {
    const t = translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Save preference
    localStorage.setItem('lang', lang);

    // Update toggle button text
    const btn = document.getElementById('lang-toggle');
    if (btn) {
        btn.textContent = lang === 'ja' ? 'EN' : 'JA';
    }
}

// Get saved or default language
function getLanguage() {
    return localStorage.getItem('lang') || 'ja';
}

// Initialize
function initI18n() {
    const lang = getLanguage();
    if (lang !== 'ja') {
        applyTranslation(lang);
    }

    const btn = document.getElementById('lang-toggle');
    if (btn) {
        btn.textContent = lang === 'ja' ? 'EN' : 'JA';
        btn.addEventListener('click', () => {
            const currentLang = getLanguage();
            const newLang = currentLang === 'ja' ? 'en' : 'ja';
            applyTranslation(newLang);
        });
    }
}

export { initI18n };
