// ### Helm copy button
var helmInstallCommandWithPlaceholder = 'helm install my-{helm-chart-name}-release webMethods/{helm-chart-name} --version {helm-chart-version}';

function copyHelmInstallCommandToClipboard(helmChartName, helmChartVersion) {
    var labelValue = helmInstallCommandWithPlaceholder.replace(/{helm-chart-name}/g, helmChartName).replace(/{helm-chart-version}/g, helmChartVersion);
    const elem = document.createElement('textarea');
    elem.value = labelValue;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');  //copy to clipboard
    document.body.removeChild(elem);
}

function showCopiedIcon(btnId) {
    var btn = document.getElementById(btnId);
    var icon = btn.querySelector("i");
    if (icon.classList.contains('dlt-icon-check')) {
        return;
    }
    icon.classList.add('dlt-icon-check');
    icon.classList.remove('dlt-icon-copy');
    btn.classList.remove('dlt-tooltip')
    
    setTimeout(function() {
        btn.classList.add('dlt-tooltip')
        icon.classList.add('dlt-icon-copy');
        icon.classList.remove('dlt-icon-check');
    }, 2000);
}
// ###