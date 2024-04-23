var fs = require('fs');
var path = require('path');
var jsyaml = require('js-yaml');
var HTMLParser = require('node-html-parser');
var marked = require('marked');

fs.readFile('./resources/static/html/base-index.html', 'utf8', function(err, data){
    var root = HTMLParser.parse(data);

    fs.readFile('./index.yaml', 'utf8', function (err, yamlText){
        // Parse YAML into JSON
        const yamlObject = jsyaml.load(yamlText);

        // Get the entries object
        const entries = yamlObject.entries;

        // Get the table body element to append the table rows
        const helmChartBody = root.getElementById('helm-charts-body');
    
        // Iterate through each entry
        Object.keys(entries).forEach((entryKey,i) => {
            const entryList = entries[entryKey]; // Get all entries for the same chart name

            // Iterate through each entry for the same chart name
            entryList.forEach(entry => {
                var currentHelmChartDiv = new HTMLParser.HTMLElement('div', '');

                // Populate a div with name, version, appVersion, and description
                currentHelmChartDiv.innerHTML = `
                    <div class="tag-card w-100 p-2">
                        <div style="display: flex; width: 40%;">
                            <span class="dlt-list-item__text">
                                <span class="dlt-list-item__primary-text"></span>
                                <span class="dlt-list-item__secondary-text"></span>
                                <span class="dlt-list-item__secondary-text"></span>
                            </span>
                        </div>
                        <div class="dlt-input-group">
                            <span class="helm-chart-description dlt-list-item__secondary-text" style="text-align: center !important"></span>
                        </div>

                        <div class="dlt-input-group">
                            <div class="dlt-form-item input">
                                <div class="dlt-form-group" style="justify-content: flex-end">
                                    <div class="helm-install-command-label dlt-text-input label-secondary"></div>
                                </div>
                            </div>
                            <button class="helm-install-command-icon dlt-button dlt-button-secondary" type="button" onclick="copyHelmInstallCommandToClipboard(this.getAttribute('helm-chart-name')); showCopiedIcon(this.getAttribute('id'))">
                                <i class="dlt-icon-copy dlt-icon"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <ul class="dlt-accordion" data-allow-multiple>
                            <li class="dlt-accordion-item">
                                <button aria-expanded="false" id="pane1" class="dlt-accordion-title">
                                    <i class="dlt-accordion-arrow dlt-icon-chevron-right"></i>
                                    <span style="font-size: 12px;"><i>View helm chart values</i></span>
                                </button>
                                <div id="helm-values-table" class="dlt-accordion-content" aria-labelledby="pane1" style="padding-left: 12px;">
                                </div>
                            </li>
                        </ul>
                    </div>
                `;

                // Add the attributes to the current helm chart div
                currentHelmChartDiv.setAttribute('class', 'helm-chart dlt-card w-100 p-2');
                currentHelmChartDiv.setAttribute('helm-chart-name', entry.name);
                currentHelmChartDiv.setAttribute('helm-chart-version', entry.version);
                currentHelmChartDiv.setAttribute('application-version', entry.appVersion);
                currentHelmChartDiv.setAttribute('helm-chart-description', entry.description);

                // Fill the current heml chart values
                helmChartSpan = currentHelmChartDiv.querySelector('div span');
                helmChartSpan.querySelectorAll('span')[0].innerHTML = entry.name.charAt(0).toUpperCase() + entry.name.slice(1);
                helmChartSpan.querySelectorAll('span')[1].innerHTML = `Chart Version: ${entry.version}`;
                helmChartSpan.querySelectorAll('span')[2].innerHTML = `Application Version: ${entry.appVersion}`;
                currentHelmChartDiv.querySelector('.helm-chart-description').innerHTML = entry.description

                // Create copy button and label
                currentHelmChartDiv.querySelector('.helm-install-command-label').setAttribute('id', `helm-install-command-label-${i}`);
                currentHelmChartDiv.querySelector('.helm-install-command-icon').setAttribute('id', `helm-install-command-icon-${i}`);
                currentHelmChartDiv.querySelector('.helm-install-command-icon').setAttribute('helm-chart-name', entry.name);
                var helmInstallCommandWithPlaceholder = 'helm install my-{helm-chart-name}-release webMethods/{helm-chart-name}';
                var result = helmInstallCommandWithPlaceholder.replace(/{helm-chart-name}/g, entry.name);
                currentHelmChartDiv.querySelector('.helm-install-command-label').innerHTML = result;

                // Add helm values table
                helmValuesTable = currentHelmChartDiv.getElementById('helm-values-table');
                helmValuesTable.innerHTML = generateHelmValuesTable(entry.name, entry.version, entry.appVersion);

                helmChartBody.appendChild(currentHelmChartDiv);
            });
        });

        fs.writeFileSync('./index.html', root.innerHTML ,{encoding:'utf8',flag:'w'})
    });
});

function generateHelmValuesTable(helmName, helmVersion, appVersion) {
    let data = fs.readFileSync(path.join(helmName, appVersion, helmVersion, 'helmValues.md'), 'utf8');
    let markdownTable = data.split("## Values")[1].split("----------------------------------------------")[0].trim();
    let table = new HTMLParser.parse('div', '');
    table.innerHTML = marked.parse(markdownTable);
    table.querySelector('table').setAttribute('class', 'dlt-card w-100 helm-values-table');
    return table.innerHTML;
}