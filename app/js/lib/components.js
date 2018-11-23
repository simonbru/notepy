export const SaveStateLabel = ({isSaving, dirty}) => {
	let labelClass = "";
	let text = "";
	if (isSaving) {
		labelClass = 'label-warning';
		text = "Sauvegarde en cours";
	} else if (dirty) {
		labelClass = 'label-danger';
		text = "Modifications non enregistrées";
	}
	return <span className={"label pull-right "+labelClass}>{text}</span>;
};