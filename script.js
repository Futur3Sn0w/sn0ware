$(document).ready(function () {
    let originalData = [];
    let filteredData = [];
    let userOS = '';
    const newAppCount = 8; // Number of items to mark as 'new'

    $.getJSON('software.json', function (data) {
        originalData = data;
        filteredData = data;
        setOSBadge(); // Set OS badge on load
        renderSoftwareList(data);
        renderSidebar(data);

        $('#search-box').on('input', function () {
            const searchTerm = $(this).val().toLowerCase();
            filteredData = originalData.filter(item => item.name.toLowerCase().includes(searchTerm));

            // Clear selected category
            $('.category').removeClass('selected');

            if (filteredData.length === 0) {
                $('body').addClass('no-results');
            } else {
                $('body').removeClass('no-results');
            }
            renderSoftwareList(filteredData);
        });

        $('.sidebar').on('click', '.category, .publisher, .compatibility', function () {
            const filterType = $(this).hasClass('category') ? 'category' :
                $(this).hasClass('publisher') ? 'publisher' :
                    'compatibility';
            const filterValue = $(this).data(filterType === 'compatibility' ? 'os' : filterType);

            $('.sidebar-section>div').removeClass('selected');
            $(this).addClass('selected');
            $('#search-box').val('');

            // Update the .appCt text and add the filter-active class
            $('.appCt').addClass('hidden');

            // Wait for the transition to finish
            $('.appCt').one('transitionend', function () {
                if (filterType === 'category') {
                    if (filterValue === 'Futur3Sn0w Essentials') {
                        $('.appCt').text(filterValue).addClass('filter-active');
                    } else {
                        $('.appCt').text('Category: ' + filterValue).addClass('filter-active');
                    }
                } else if (filterType === 'publisher') {
                    $('.appCt').text('Publisher: ' + filterValue).addClass('filter-active');
                } else if (filterType === 'compatibility') {
                    $('.appCt').text('Compatible with ' + filterValue).addClass('filter-active');
                }

                setTimeout(() => {
                    $('.appCt').removeClass('hidden');
                }, 90);
                // Remove the hidden class to fade back in
            });

            // Filter the data and render the software list
            if (filterType === 'category') {
                filteredData = filterSoftwareByCategory(originalData, filterValue);
            } else if (filterType === 'publisher') {
                filteredData = filterSoftwareByPublisher(originalData, filterValue);
            } else if (filterType === 'compatibility') {
                filteredData = filterSoftwareByOS(originalData, filterValue);
            }
            renderSoftwareList(filteredData);
            $('#clear-filter').show();
            $('body').removeClass('no-results');
        });

        $('#clear-filter').click(function () {
            $(this).hide();
            filteredData = originalData;
            renderSoftwareList(filteredData);
            $('#search-box').val('');
            $('body').removeClass('no-results');
            $('.sidebar-section>div').removeClass('selected'); // Deselect all categories

            // Reset the .appCt text to "All Applications"
            $('.appCt').text(' apps').removeClass('filter-active');
        });

        $('.sidebar-section .section-label').on('click', function () {
            $('.sidebar-section:not(:hover)').removeClass('open');
            $(this).parent().toggleClass('open');
        })

        $(document).on('click', '.category-chip', function () {
            const category = $(this).text();
            $('.category').removeClass('selected'); // Deselect all categories
            $('.category[data-category="' + category + '"]').addClass('selected'); // Select corresponding sidebar category

            // Clear search box
            $('#search-box').val('');

            filteredData = filterSoftwareByCategory(originalData, category);
            renderSoftwareList(filteredData);
            $('#clear-filter').show();
            $('body').removeClass('no-results');
        });

        // Add click event for software items
        $(document).on('click', '.software-item', function () {
            const itemName = $(this).data('id');
            const item = filteredData.find(dataItem => dataItem.name === itemName);
            renderExpandedView(item);
        });

        $('#software-list').on('scroll', function () {
            const scrollTop = $(this).scrollTop();

            if (scrollTop >= 10) {
                $(this).addClass('scrolled');
            } else {
                $(this).removeClass('scrolled');
            }
        });
    });

    const listTypeKey = 'softwareListType';
    const softwareList = $('#software-list');

    // Initialize based on localStorage
    const savedType = localStorage.getItem(listTypeKey);
    if (savedType) {
        $('#' + savedType).prop('checked', true);
        $('.software-area').addClass(savedType);
    } else {
        $('#cardType').prop('checked', true);
        $('.software-area').addClass('cardType');
        localStorage.setItem(listTypeKey, 'cardType');
    }

    // Radio buttons change event
    $('input[name="listType"]').change(function () {
        const selectedType = $(this).attr('id');

        localStorage.setItem(listTypeKey, selectedType);

        // Add the hidden class to fade out
        softwareList.addClass('hidden');

        // Wait for the transition to finish
        softwareList.one('transitionend', function () {
            // Change the class after fade-out is complete
            $('.software-area').removeClass('listType cardType').addClass(selectedType);

            setTimeout(() => {
                softwareList.removeClass('hidden');
            }, 100);
            // Remove the hidden class to fade back in
        });
    });

    let currentIndex = 0;
    function rotateText() {
        const subHead = $('.subHead');

        // List of preset strings to rotate through
        const presetStrings = [
            "Click on an app for more details",
            "Apps with a blue badge are recently added",
            "Use the sidebar to filter specific apps"
        ];

        // The index of the current string being displayed

        // Add the hidden class to fade out the text
        subHead.addClass('hidden');

        // Wait for the transition to finish
        subHead.one('transitionend', function () {
            // Change the text to the next preset string
            currentIndex = (currentIndex + 1) % presetStrings.length;
            subHead.text(presetStrings[currentIndex]);

            // Remove the hidden class to fade the new text back in
            subHead.removeClass('hidden');
        });
    }

    setInterval(rotateText, 8000);

    function renderSoftwareList(data) {
        const $list = $('#software-list');
        $list.children('.software-item').remove();

        const fallbackIcon = 'fallback.svg'; // Adjust path as needed
        const totalItems = originalData.length; // Keep the total number based on the original data

        $('.appCt').attr('data-total-apps', totalItems);

        const sortedData = sortSoftware(data, 'name');

        sortedData.forEach((item, index) => {
            const originalIndex = originalData.findIndex(origItem => origItem.name === item.name);

            const $softInfo = $('<div class="soft-info"></div>');

            const $publisherChip = $(`<div class="info-chip publisher">${item.publisher || 'Unknown'}</div>`);
            $softInfo.append($publisherChip);

            const $badges = $(`<div class="badges"></div>`)

            if (item.compatibleWith.includes(userOS)) {
                const $compatibleBadge = $('<div class="info-chip compatible" title="This app has been marked compatible with your OS"><i class="fa-solid fa-circle-check"></i></div>');
                $badges.append($compatibleBadge);
            }

            if (originalIndex >= totalItems - newAppCount) {
                const $newBadge = $('<div class="info-chip new-badge" title="This app was added recently"><i class="fa-solid fa-circle-plus"></i></div>');
                $badges.append($newBadge);
            }

            if (item.categories.includes('Open-source')) {
                const $openSourceBadge = $('<div class="info-chip open-source" title="This app is open-source"><i class="fa-brands fa-github"></i></div>');
                $badges.append($openSourceBadge);
            }

            $softInfo.append($badges);

            const iconUrl = item.iconUrl || fallbackIcon;
            const firstSentence = item.description.split('. ')[0] + '.';

            const $item = $(`
                <div class="software-item hidden" data-id="${item.name}">
                    <div class="item-header">
                        <div class="iconImg">
                            <img src="${iconUrl}" alt="${item.name}">
                        </div>
                        <div class="info">
                            <h3>${item.name}</h3> <!-- Removed the link -->
                        </div>
                    </div>
                    <p>${firstSentence}</p>
                </div>
            `);

            $item.find('.info').append($softInfo);
            $item.find('.item-header').append(`<div class="pricing-chip">${item.pricing}</div>`);

            $list.append($item);

            $item.delay(index * 50).queue(function (next) {
                $(this).removeClass('hidden');
                next();
            });
        });
    }


    function renderSidebar(data) {
        const categories = {};
        const publishers = {};
        const osCompatibility = {}; // New section for OS compatibility

        data.forEach(item => {
            // Categories
            item.categories.forEach(category => {
                if (!categories[category]) {
                    categories[category] = 0;
                }
                categories[category]++;
            });

            // Publishers
            const publisher = item.publisher || 'Unknown'; // Default to 'Unknown' if no publisher
            if (!publishers[publisher]) {
                publishers[publisher] = 0;
            }
            publishers[publisher]++;

            // OS Compatibility
            item.compatibleWith.forEach(os => {
                if (!osCompatibility[os]) {
                    osCompatibility[os] = 0;
                }
                osCompatibility[os]++;
            });
        });

        const $sidebar = $('.sidebar');
        $sidebar.children('.sidebar-section').remove(); // Clear the sidebar

        // Create separate divs for categories, publishers, and OS compatibility
        const $categoriesSection = $('<div class="sidebar-section categories-section" data-title="Categories"></div>');
        const $publishersSection = $('<div class="sidebar-section publishers-section" data-title="Publishers"></div>');
        const $compatibilitySection = $('<div class="sidebar-section compatibility-section" data-title="Compatibility"></div>');

        // Add labels to each section
        $categoriesSection.prepend('<span class="section-label">Categories</span>');
        $publishersSection.prepend('<span class="section-label">Publishers</span>');
        $compatibilitySection.prepend('<span class="section-label">Compatibility</span>');

        // Render categories
        Object.keys(categories).sort().forEach(category => {
            const count = categories[category];
            const $category = $(`<div class="category" data-category="${category}">${category} <span class="count">(${count})</span></div>`);
            $categoriesSection.append($category);
        });

        // Render publishers
        Object.keys(publishers).sort().forEach(publisher => {
            const count = publishers[publisher];
            const $publisher = $(`<div class="publisher" data-publisher="${publisher}">${publisher} <span class="count">(${count})</span></div>`);
            $publishersSection.append($publisher);
        });

        // Render OS Compatibility
        Object.keys(osCompatibility).sort().forEach(os => {
            const count = osCompatibility[os];
            const $os = $(`<div class="compatibility" data-os="${os}">${os} <span class="count">(${count})</span></div>`);
            $compatibilitySection.append($os);
        });

        // Append sections to the sidebar
        $sidebar.append($categoriesSection);
        $sidebar.append($publishersSection);
        $sidebar.append($compatibilitySection);

        // var multiple = new Multiple({
        //     selector: '.section-label',
        //     background: 'var(--software-item-g)'
        // });
    }

    function setOSBadge() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Win') !== -1) userOS = 'Windows';
        else if (userAgent.indexOf('Mac') !== -1) userOS = 'macOS';
        else if (userAgent.indexOf('Android') !== -1) userOS = 'Android';
        else if (userAgent.indexOf('iPhone') !== -1) userOS = 'iOS';
        else if (userAgent.indexOf('Linux') !== -1) userOS = 'Linux';

        $('#os-badge').text(userOS);
    }

    function sortSoftware(data, sortBy) {
        return data.slice().sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });
    }

    function filterSoftwareByCategory(data, category) {
        return data.slice().filter(item => item.categories.includes(category));
    }

    function filterSoftwareByPublisher(data, publisher) {
        return data.slice().filter(item => (item.publisher || 'Unknown') === publisher);
    }

    function filterSoftwareByOS(data, os) {
        return data.slice().filter(item => item.compatibleWith.includes(os));
    }

    $(document).click(function (event) {
        if (!$(event.target).closest('.software-item, .expanded-item').length) {
            $('#expanded-view').addClass('hidden');
        }
    });

    function renderExpandedView(item) {
        const osList = ["Windows", "macOS", "Android", "iOS", "Linux"];
        const $compatibility = $('<div class="compatibility"></div>');

        osList.forEach(os => {
            const $osChip = $(`<div class="compatibility-chip compatible ${os === userOS ? 'user-os' : ''}">${os}</div>`);
            if (item.compatibleWith.includes(os)) {
                $compatibility.append($osChip);
            }
        });

        const iconUrl = item.iconUrl || 'fallback.svg';
        const homepageLink = item.homepage;
        const publisherUrl = item.publisherURL || homepageLink; // Use publisherURL if available, otherwise homepage

        // Create buttons div
        const $buttonsDiv = $('<div class="buttons"></div>');
        let downloadButtons = [];

        // Handle standard downloadUrl
        if (item.downloadUrl) {
            downloadButtons.push(`<a href="${item.downloadUrl}" class="pricing-chip">Download</a>`);
        }

        // Handle additional download URLs (downloadUrl-A, downloadUrl-B, downloadUrl-C, etc.)
        ['A', 'B', 'C', 'D'].forEach(suffix => {
            const downloadKey = `downloadUrl-${suffix}`;
            if (item[downloadKey]) {
                const [buttonText, downloadLink] = item[downloadKey].split(',');
                downloadButtons.push(`<a href="${downloadLink.trim()}" class="pricing-chip">${buttonText.trim()}</a>`);
            }
        });

        // If there are 2 or more download buttons, create a sub-div for them
        if (downloadButtons.length >= 2) {
            const $downloadSubDiv = $('<div class="download-buttons"></div>');
            downloadButtons.forEach(buttonHtml => {
                $downloadSubDiv.append(buttonHtml);
            });
            $buttonsDiv.append($downloadSubDiv);
        } else if (downloadButtons.length === 1) {
            // If there is only one download button, just append it directly
            $buttonsDiv.append(downloadButtons[0]);
        }

        // Handle homepage button
        if (homepageLink) {
            $buttonsDiv.append(`<a href="${homepageLink}" class="homepage-button">Visit Homepage</a>`);
        }

        // Update the publisher badge to be a clickable link
        const publisherLabel = item.publisher || 'Unknown';
        const $publisherBadge = $(`<a href="${publisherUrl}" class="publisher-badge" target="_blank">${publisherLabel} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`);

        // Determine if the item is new based on the global newAppCount and add a "new" div
        const originalIndex = originalData.findIndex(origItem => origItem.name === item.name);
        const isNewApp = originalIndex >= originalData.length - newAppCount;
        const $newBadge = isNewApp ? $('<div class="new-badge">Recently added</div>') : '';

        // Build the expanded content
        const $expandedContent = $(`
            <div class="expanded-item">
                <div class="expanded-header">
                    <img src="${iconUrl}" alt="${item.name}">
                    <div class="info">
                        <h3>${item.name}</h3>
                        ${$publisherBadge.prop('outerHTML')}
                        ${$newBadge.length ? $newBadge.prop('outerHTML') : ''}
                    </div>
                </div>
                <p class="desc">${item.description}</p>
                ${item.notes ? `<p class="notes">"${item.notes}"</p>` : ''}
                <div class="categories">
                    ${item.categories.map(category => `<div class="category-chip" data-category="${category}">${category}</div>`).join('')}
                </div>
                <div class="compatibility">${$compatibility.html()}</div>
                ${$buttonsDiv.prop('outerHTML')}
            </div>
        `);

        $('#expanded-view').html($expandedContent).removeClass('hidden');
    }




});
