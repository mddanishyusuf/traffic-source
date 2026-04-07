import {
  SiGooglechrome,
  SiSafari,
  SiFirefoxbrowser,
  SiBrave,
  SiOpera,
  SiVivaldi,
  SiDuckduckgo,
  SiSamsung,
  SiLinux,
  SiAndroid,
  SiUbuntu,
  SiArchlinux,
  SiFedora,
} from 'react-icons/si';
import {
  FaEdge,
  FaInternetExplorer,
  FaWindows,
  FaApple,
  FaDesktop,
  FaMobileAlt,
  FaTabletAlt,
  FaQuestion,
} from 'react-icons/fa';
import { TbDeviceTv, TbWorld } from 'react-icons/tb';

const SIZE = 14;

function browserIcon(name = '') {
  const v = name.toLowerCase();
  if (v.includes('chrome')) return <SiGooglechrome size={SIZE} color="#4285F4" />;
  if (v.includes('safari')) return <SiSafari size={SIZE} color="#1B88CA" />;
  if (v.includes('firefox')) return <SiFirefoxbrowser size={SIZE} color="#FF7139" />;
  if (v.includes('edge')) return <FaEdge size={SIZE} color="#0078D7" />;
  if (v.includes('brave')) return <SiBrave size={SIZE} color="#FB542B" />;
  if (v.includes('opera')) return <SiOpera size={SIZE} color="#FF1B2D" />;
  if (v.includes('vivaldi')) return <SiVivaldi size={SIZE} color="#EF3939" />;
  if (v.includes('duckduckgo')) return <SiDuckduckgo size={SIZE} color="#DE5833" />;
  if (v.includes('samsung')) return <SiSamsung size={SIZE} color="#1428A0" />;
  if (v.includes('ie') || v.includes('explorer')) return <FaInternetExplorer size={SIZE} color="#1EBBEE" />;
  return <TbWorld size={SIZE} />;
}

function osIcon(name = '') {
  const v = name.toLowerCase();
  if (v.includes('windows')) return <FaWindows size={SIZE} color="#0078D6" />;
  if (v.includes('mac') || v.includes('ios') || v.includes('darwin')) return <FaApple size={SIZE} />;
  if (v.includes('android')) return <SiAndroid size={SIZE} color="#3DDC84" />;
  if (v.includes('ubuntu')) return <SiUbuntu size={SIZE} color="#E95420" />;
  if (v.includes('arch')) return <SiArchlinux size={SIZE} color="#1793D1" />;
  if (v.includes('fedora')) return <SiFedora size={SIZE} color="#294172" />;
  if (v.includes('chrome')) return <SiGooglechrome size={SIZE} color="#4285F4" />;
  if (v.includes('linux')) return <SiLinux size={SIZE} />;
  return <FaQuestion size={SIZE} />;
}

function deviceIcon(name = '') {
  const v = name.toLowerCase();
  if (v.includes('mobile') || v.includes('phone')) return <FaMobileAlt size={SIZE} />;
  if (v.includes('tablet') || v.includes('ipad')) return <FaTabletAlt size={SIZE} />;
  if (v.includes('tv') || v.includes('console')) return <TbDeviceTv size={SIZE} />;
  return <FaDesktop size={SIZE} />;
}

export default function TechIcon({ type, name }) {
  let icon;
  if (type === 'browser') icon = browserIcon(name);
  else if (type === 'os') icon = osIcon(name);
  else icon = deviceIcon(name);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)', flexShrink: 0, width: SIZE, height: SIZE }}>
      {icon}
    </span>
  );
}
