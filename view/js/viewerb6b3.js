class Viewer extends NFTLib {
	constructor(config, tokenID, msg) {
		super(config);
		this.msg = msg;
		this.tokenID = tokenID;
		$('.btn-download-transparent').click(this.download.bind(this));
	}
	async download() {
		super.disconnect();
		await this.connect();

		if(this.signer == null) return;

		let msg = 'Please sign this message: ' + this.msg;
		let address = await this.signer.getAddress();
		let owner = await this.contract.ownerOf(this.tokenID);
		if (owner != address) {
			this.message('Only the owner can download the transparent version');
			return;
		}
		if (this.walletConnection != null) {
			var signature = await this.provider.send(
				'personal_sign',
				[ethers.utils.hexlify(ethers.utils.toUtf8Bytes(msg)), address.toLowerCase()]
			);
		} else {
			var signature = await this.signer.signMessage(msg);
		}
		window.open('https://downloads.killabears.com/transparent/?token=' + this.tokenID + '&address=' + address + '&msg=' + this.msg + '&signature=' + signature, '_blank');
	}
}