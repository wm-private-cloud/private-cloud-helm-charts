var fs = require('fs');
var path = require('path');
var jsyaml = require('js-yaml');
var HTMLParser = require('node-html-parser');
var marked = require('marked');
var compareVersions = require('compare-versions');

let homePageBaseHTML = HTMLParser.parse(fs.readFileSync('./resources/static/html/base-index.html', 'utf8'));
let indexYaml = jsyaml.load(fs.readFileSync('./index.yaml', 'utf8'));
let helmChartBody = homePageBaseHTML.getElementById('helm-charts-body');

class Version {
    constructor(appVersion, chartVersions) {
        this.appVersion = appVersion;
        this.chartVersions = chartVersions;
    }
}

class HelmChart {
    name;
    versions = [];

    constructor(name) {
        this.name = name;
    }

    addVersion(version) {
        this.versions.push(version);
    }
}

const helmCharts = parseHelmCharts();

let optionScript = new HTMLParser.HTMLElement('script', '');
optionScript.innerHTML += `$(".select-input-chart-version").change(function () { let chart = $(this).val().split(' ')[1]; updateHelmChartLinkPage(chart);}); $(".select-input-app-version").change(function () { let version = $(this).val().split(' ')[0]; let chart = $(this).val().split(' ')[1]; let options = document.getElementById('select-input-chart-version-' + chart); let optionsChosen = document.getElementById('select_input_chart_version_' + chart + '_chosen'); options.innerHTML = '';`;

helmCharts.forEach((chart, chartIndex) => {
    let chartAppVersionsOptions = "";
    let chartVersionsOptions = "";
    let currentChartOptionScript = "";
    let latestAppVersion = "";
    let latestChartVersion = "";
    let helmChartDescription = indexYaml["entries"][chart.name][0]["description"];

    helmChartAppVersion = chart.versions.forEach((version, index) => {
        // generate helm chart versions options 
        currentChartOptionScript += `if(chart === "${chart.name}" && version === "${version.appVersion}") {`;
        chartAppVersionsOptions += `<option value="${version.appVersion} ${chart.name}">${version.appVersion}</option>`;
        
        // get chart versions for latest app version
        if (index === 0) {
            latestAppVersion = version.appVersion;
            version.chartVersions.forEach(chartVersion => {
                chartVersionsOptions += `<option value="${chartVersion} ${chart.name}">${chartVersion}</option>`;
            });
        }

        version.chartVersions.forEach((chartVersion, chartVersionIndex) => {
            // generate js code for version options
            if(chartVersionIndex === 0) {
                if (index === 0) {
                    latestChartVersion = chartVersion;
                }
                currentChartOptionScript += `optionsChosen.querySelectorAll('.chosen-single')[0].innerHTML = '<span>${chartVersion}</span><i class="dlt-icon-dropdown multiselect-icon"></i><div><b></b></div>'; optionsChosen.querySelectorAll('.chosen-results')[0].innerHTML = ''; optionsChosen.querySelectorAll('.chosen-results')[0].innerHTML += '<li class="active-result result-selected highlighted" data-option-array-index="${chartVersionIndex}" role="option" id="" aria-selected="true">${chartVersion}</li>';`;
            } else {
                currentChartOptionScript += `optionsChosen.querySelectorAll('.chosen-results')[0].innerHTML += '<li class="active-result" data-option-array-index="${chartVersionIndex}" role="option" id="" aria-selected="true">${chartVersion}</li>';`;
            }
            currentChartOptionScript += `options.innerHTML += '<option value="${chartVersion} ${chart.name}">${chartVersion}</option>';`;
        
            // generate dedicated page for the chart
            let dedicateChartPage = HTMLParser.parse(fs.readFileSync('./resources/static/html/base-chart-page.html', 'utf8'));

            let currentDedicatedPageChartDiv = new HTMLParser.HTMLElement('div', '');
            currentDedicatedPageChartDiv.innerHTML = `
                <div class="mx-0 pr-0 pl-6ml-0" style="margin-top: 0px !important">
                    <div style="align-items: center;display: flex;margin: 20px;">
                        <div style="padding-left: 15px; width: 80%;">${chart.name} / Application Version: ${version.appVersion} / Chart Version: ${chartVersion}</div>

                        <div class="dlt-form-item input" style="display: flex; padding-right:15px">
                            <div class="dlt-form-group" style="justify-content: flex-end">
                                <div class="helm-install-command-label dlt-text-input label-secondary" id="helm-install-command-label-0">helm install my-${chart.name}-release webMethods/${chart.name} --version ${chartVersion}</div>
                                <div class="dlt-form-item sm-input">
                                    <button class="helm-install-command helm-install-command-icon dlt-button dlt-button-secondary dlt-tooltip dlt-tooltip-bottom-center" aria-description="Copy install command" type="button" id="helm-copy-button" onclick="copyHelmInstallCommandToClipboard('${chart.name}', '${chartVersion}'); showCopiedIcon('helm-copy-button')">
                                        <i class="dlt-icon-copy dlt-icon"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr style="margin-top: 0px;"/>
                
                    <div id="helm-chart-content-body" class="helm-chart-content-body mx-0 pr-0 pl-6ml-0 d-flex flex-wrap flex-direction-row" style="display: flex;">
                        <div id="helm-chart-readme" style="width: 60%; margin: 0 auto; padding-left: 20px; padding-right: 10px;">
                            <zero-md>
                                <script id="markdown-content" type="text/markdown">
${generateReadmeMarkdown(chart.name, chartVersion, version.appVersion)}
                                </script>
                            </zero-md>
                        </div>
                        <div id="helm-values-table-container" style="width: 40%; margin: 0 auto; padding-left: 10px; padding-right: 20px;">
                            ${generateHelmValuesTable(chart.name, chartVersion, version.appVersion)}
                        </div>
                    </div>
                </div>
            `;

            if (currentDedicatedPageChartDiv.getElementById('markdown-content').innerHTML === '') {
                currentDedicatedPageChartDiv.getElementById('helm-chart-readme').outerHTML = '';
                currentDedicatedPageChartDiv.getElementById('helm-chart-readme').innerHTML = '';
                currentDedicatedPageChartDiv.getElementById('helm-chart-readme').setAttribute('style', '');
                currentDedicatedPageChartDiv.getElementById('helm-values-table-container').setAttribute('style', 'margin: 0 auto; padding-left: 20px; padding-right: 20px;');
                currentDedicatedPageChartDiv.getElementById('helm-chart-content-body').setAttribute('style', '');
                currentDedicatedPageChartDiv.getElementById('helm-chart-content-body').setAttribute('class', 'helm-chart-content-body mx-0 pr-0 pl-6ml-0');
            }

            dedicateChartPage.getElementById('body').innerHTML = currentDedicatedPageChartDiv.childNodes[1];
            fs.writeFileSync(path.join(`${chart.name}_${version.appVersion}_${chartVersion}.html`), dedicateChartPage.innerHTML ,{encoding:'utf8',flag:'w'});
        });

        currentChartOptionScript += `$("#select-input-chart-version-${chart.name}").trigger("chosen:updated");}`;
    })
    optionScript.innerHTML += currentChartOptionScript;

    // generate html object for chart
    let currentHelmChartDiv = new HTMLParser.HTMLElement('div', '');
    currentHelmChartDiv.innerHTML = `
        <div class="helm-chart p-0 ml-6 mb-0 mr-0 mt-6" helm-chart-name=${chart.name} helm-chart-description="${helmChartDescription}" style="width: 320px;">
            <a href="${chart.name}_${latestAppVersion}_${latestChartVersion}.html" style="text-decoration:none">
                <div class="dlt-card" style="display: flex; height: 200px; padding-bottom:24px;">
                    <span class="dlt-list-item__text">
                        <img src="./resources/static/img/favicon.ico" alt="logo" style="max-width: 20px; max-height: 20px; padding-bottom: 5px">
                        <span class="dlt-list-item__primary-text" style="font-size: 18px;">| ${chart.name.charAt(0).toUpperCase() + chart.name.slice(1)}</span>
                        
                        <span class="helm-chart-description dlt-list-item__secondary-text">${helmChartDescription}</span>

                        <div class="d-flex flex-wrap flex-direction-row align-items-center" style="padding-top: 15px">
                            <div class="dlt-card-versions pl-0 pb-0 pr-2" style="align-content: flex-end; width:40%;">
                                <div class="dlt-form-item sm-input">
                                    <label class="dlt-form-label" for="select-input-app-version-${chart.name}">App version</label>
                                    <div class="dlt-form-group">
                                        <select id="select-input-app-version-${chart.name}" class="dlt-single-select select-input-app-version">
                                            ${chartAppVersionsOptions}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        
                            <div class="dlt-card-versions pl-0 pb-0 pr-2" style="align-content: flex-end; width:40%;">
                                <div class="dlt-form-item sm-input">
                                    <label class="dlt-form-label" for="select-input-chart-version-${chart.name}">Chart version</label>
                                    <div class="dlt-form-group">
                                        <select id="select-input-chart-version-${chart.name}" class="dlt-single-select select-input-chart-version">
                                            ${chartVersionsOptions}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="dlt-card-versions pl-0 pb-0 pr-2" style="padding-top: 12px; margin-left: 5px;">
                                <div class="dlt-form-item sm-input">
                                    <button class="helm-install-command helm-install-command-icon dlt-button dlt-button-secondary dlt-tooltip dlt-tooltip-bottom-center" aria-description="Copy install command" type="button" id="helm-install-command-icon-${chartIndex}" helm-chart-name="${chart.name}">
                                        <i class="dlt-icon-copy dlt-icon"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </span>
                </div>
            </a>
        </div>
    `;

    helmChartBody.appendChild(currentHelmChartDiv.childNodes[1]);
});

optionScript.innerHTML += `updateHelmChartLinkPage(chart);});`;
homePageBaseHTML.getElementsByTagName('body')[0].appendChild(optionScript);
fs.writeFileSync('./index.html', homePageBaseHTML.innerHTML ,{encoding:'utf8',flag:'w'})

function parseHelmCharts() { 
    let helmCharts = [];
    fs.readdirSync('helm-charts').forEach((chart) => {
        let currentChart = new HelmChart(chart);
    
        fs.readdirSync(path.join("helm-charts", chart)).sort(compareVersions.compareVersions).reverse().forEach(appVersion => {
            let chartVersions = fs.readdirSync(path.join("helm-charts", chart, appVersion)).sort(compareVersions.compareVersions).reverse();
            currentChart.addVersion(new Version(appVersion, chartVersions));
        });
    
        helmCharts.push(currentChart);
    });
    return helmCharts;
}

function generateHelmValuesTable(helmName, helmVersion, appVersion) {
    if (fs.existsSync(path.join('helm-charts', helmName, appVersion, helmVersion, 'helmValues.md'))) {
        let data = fs.readFileSync(path.join('helm-charts', helmName, appVersion, helmVersion, 'helmValues.md'), 'utf8');
        let markdownTable = data.split("## Values")[1].split("----------------------------------------------")[0].trim();
        let table = new HTMLParser.parse('div', '');
        table.innerHTML = marked.parse(markdownTable);
        table.querySelector('table').setAttribute('class', 'dlt-card w-100 helm-values-table');

        let tableHTML = HTMLParser.parse(table.innerHTML);
        captionElement = new HTMLParser.HTMLElement('caption', '');
        captionElement.setAttribute('style', 'font-size: large; text-align: center; caption-side: top;');
        captionElement.textContent = 'Helm Values';
        tableHTML.querySelector('table').appendChild(captionElement);

        return tableHTML.innerHTML;
    }
}

function generateReadmeMarkdown(helmName, helmVersion, appVersion) {
    let readmePath = path.join('helm-charts', helmName, appVersion, helmVersion, 'README.md');
    let readmeContent = "";
    if(fs.existsSync(readmePath)) {
        readmeContent = fs.readFileSync(readmePath, 'utf8').trimStart();
    }
    return readmeContent;
}