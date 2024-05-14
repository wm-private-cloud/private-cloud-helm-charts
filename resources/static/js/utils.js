// ### Helm copy button on front page
Array.from(document.getElementsByClassName('helm-install-command')).forEach((el) => {
    el.addEventListener('click', function(event) {
        event.preventDefault(); // Prevents the helm chart box link when clicking the copy button
        chartName = el.getAttribute("helm-chart-name")
        chartVersion = document.getElementById('select_input_chart_version_' + chartName + '_chosen').querySelector(".chosen-single").textContent.trim();
        copyHelmInstallCommandToClipboard(chartName, chartVersion);
        showCopiedIcon(el.getAttribute("id"))
    });
});

// ###

// ### Search functionality
function searcHelmCharts() {
    let filter = document.getElementById("helm-chart-search-input").value.toLowerCase();
    let charts = document.getElementById("helm-charts-body").querySelectorAll(':scope > div');
    for (let i = 0; i < charts.length; i++) {
        if (propertyValueMatch(charts[i], filter, "helm-chart-name") ||
            propertyValueMatch(charts[i], filter, "helm-chart-description")) {
            charts[i].style.display = "";
        } else {
            charts[i].style.display = "none";
        }
    }
}

function propertyValueMatch(chart, filter, attribute) {
    return chart.getAttribute(attribute).toLowerCase().indexOf(filter) > -1;
}
// ###

// ### Update helm chart box in home page
function updateHelmChartLinkPage(chart) { 
    chartVersion = document.getElementById('select_input_chart_version_' + chart + '_chosen').querySelector(".chosen-single").textContent.trim();
    appVersion = document.getElementById('select_input_app_version_' + chart + '_chosen').querySelector(".chosen-single").textContent.trim();
    charts = document.getElementsByClassName('helm-chart')
    for (var i = 0; i < charts.length; i++) {
        if (charts[i].getAttribute("helm-chart-name") === chart) {
            oldLink = charts[i].querySelector(':scope > a')['href'];
            var linkParts = oldLink.split('_');
            linkParts[1] = appVersion;
            linkParts[2] = chartVersion;
            var newLink = linkParts.join('_') + ".html";
            charts[i].querySelector(':scope > a')['href'] = newLink;
            break;
        }
    }
}
// ###