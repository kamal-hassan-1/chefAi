import logo from '../assets/chef-ai.png';

export default function Header() {
	return (
		<header className="site-header">
			<div className="brand" aria-label="Chef AI">
				<img src={logo} alt="" className="brand-mark" />
				<span className="brand-name">chef<span>ai</span></span>
			</div>
			<div className="header-note"><span className="header-sparkle" aria-hidden="true">✳</span> COOK A LITTLE MORE OFTEN</div>
		</header>
	);
}
