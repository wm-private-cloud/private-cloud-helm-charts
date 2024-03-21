var helmInstallCommandWithPlaceholder = 'helm install my-{helm-chart-name}-release webMethods/{helm-chart-name}';

function showPullCommand() {
    document.getElementById('dropdown-command-box').style.display = "inline-flex";
    document.getElementById('tab-link-3').className = "dlt-tab-link";
}

function updateHelmInstallCommand(helmChartElement, helmChartName) {
    var result  = helmInstallCommandWithPlaceholder.replace(/{helm-chart-name}/g, helmChartName);

    helmChartElement.getElementsByClassName("helm-install-command-label")[0].innerHTML = result;
}

function copyHelmInstallCommandToClipboard(helmChartName) {
    var labelValue = helmInstallCommandWithPlaceholder.replace(/{helm-chart-name}/g, helmChartName);

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
        setTimeout(function() {
            icon.classList.add('dlt-icon-copy');
            icon.classList.remove('dlt-icon-check');
        }, 2000);
}

function showCopiedText(btnId) {
    var btn = document.getElementById(btnId);
    if (btn.textContent == 'Copied!') {
        return;
    }
    btn.textContent = 'Copied!';
    setTimeout(function() {
         btn.textContent = 'Copy username'
    }, 2000);
}

function toggleHelmInstallCommandButton(inputElementId) {
    document.getElementById("get-helm-install-command-button").disabled = !document.getElementById(inputElementId).checked;
}

function toggleButton() {
    // Hiding the sidebar on small devices
    $('#content, #toggle, #vertical-nav, #sidebar, #content-col').toggleClass('active');
}
