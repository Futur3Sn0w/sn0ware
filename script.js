$(document).ready(function () {
    let originalData = [];
    let filteredData = [];
    let $masonryList;
    let userOS = '';

    $.getJSON('software.json', function (data) {
        originalData = data;
        filteredData = data;
        setOSBadge(); // Set OS badge on load
        renderSoftwareList(data);
        renderSidebar(data);

        $('#clear-filter').click(function () {
            $(this).hide();
            filteredData = originalData;
            renderSoftwareList(filteredData);
            $('#search-box').val('');
            $('body').removeClass('no-results');
            $('.sidebar-section>div').removeClass('selected'); // Deselect all categories
        });

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


        $('.sidebar').on('click', '.category', function () {
            const category = $(this).data('category');
            $('.category').removeClass('selected'); // Deselect all categories
            $(this).addClass('selected'); // Select clicked category
            $('#search-box').val(''); // Clear search box
            filteredData = filterSoftwareByCategory(originalData, category);
            renderSoftwareList(filteredData);
            $('#clear-filter').show();
            $('body').removeClass('no-results');
        });

        $('.sidebar').on('click', '.publisher', function () {
            const publisher = $(this).data('publisher');
            $('.publisher').removeClass('selected'); // Deselect all publishers
            $(this).addClass('selected'); // Select clicked publisher
            $('#search-box').val(''); // Clear search box
            filteredData = filterSoftwareByPublisher(originalData, publisher);
            renderSoftwareList(filteredData);
            $('#clear-filter').show();
            $('body').removeClass('no-results');
        });

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

        $('#close-expanded-view').click(function () {
            $('#expanded-view').addClass('hidden');
        });

    });

    function renderSoftwareList(data) {
        const $list = $('#software-list');
        if ($masonryList) {
            $list.masonry('destroy'); // Destroy Masonry instance before re-rendering
        }
        $list.empty();

        const fallbackIcon = 'fallback.svg'; // Adjust path as needed
        const newBadgeCount = 4; // Number of items to mark as 'new'
        const totalItems = data.length;

        // Sort the data alphabetically before rendering
        const sortedData = sortSoftware(data, 'name');

        sortedData.forEach((item, sortedIndex) => {
            const originalIndex = originalData.findIndex(origItem => origItem.name === item.name);

            // Create categories chips
            const $categories = $('<div class="categories"></div>');
            item.categories.forEach(category => {
                const $chip = $(`<div class="category-chip">${category}</div>`);
                $chip.click(function () {
                    filteredData = filterSoftwareByCategory(originalData, category);
                    renderSoftwareList(filteredData);
                    $('#clear-filter').show();
                    $('body').removeClass('no-results');
                });
                $categories.append($chip);
            });

            // Create soft-info section with info-chips
            const $softInfo = $('<div class="soft-info"></div>');

            // Add the publisher as an info-chip first
            const $publisherChip = $(`<div class="info-chip publisher">${item.publisher || 'Unknown'}</div>`);
            $softInfo.append($publisherChip);

            // Add the 'Compatible' chip if the software is compatible with the user's OS
            if (item.compatibleWith.includes(userOS)) {
                const $compatibleBadge = $('<div class="info-chip compatible">Compatible</div>');
                $softInfo.append($compatibleBadge);
            }

            const iconUrl = item.iconUrl || fallbackIcon;
            const downloadLink = item.downloadUrl || item.homepage;
            const firstSentence = item.description.split('. ')[0] + '.';

            const $item = $(`
                <div class="software-item" data-id="${item.name}" style="transform: translateY(100px); opacity: 0;">
                    <div class="item-header">
                        <img src="${iconUrl}" alt="${item.name}">
                        <div class="info">
                            <h3>${item.name}</h3> <!-- Removed the link -->
                        </div>
                    </div>
                    <p>${firstSentence}</p>
                </div>
            `);

            // Append soft-info (publisher and compatibility) and category chips
            $item.find('.info').append($softInfo);
            $item.find('.item-header').append(`<a href="${downloadLink}" class="pricing-chip">${item.pricing}</a>`);

            if (originalIndex >= totalItems - newBadgeCount) {
                const $newBadge = $('<span class="new-badge">New</span>');
                $item.find('.item-header').append($newBadge);
            }

            $item.append($categories);
            $list.append($item);
        });

        // Initialize Masonry after appending all items
        $masonryList = $list.masonry({
            itemSelector: '.software-item',
            columnWidth: 300,
            horizontalOrder: true,
            fitWidth: true,
            gutter: 10,
            hiddenStyle: {
                transform: 'translateY(50px) scale(1.1)',
                opacity: 0
            },
            visibleStyle: {
                transform: 'translateY(0px) scale(1)',
                opacity: 1
            }
        });

        // Animate items in after Masonry initialization
        $list.find('.software-item').each(function (index, element) {
            setTimeout(() => {
                $(element).css({
                    transform: 'translateY(0px) scale(1)',
                    opacity: 1
                });
            }, index * 40); // Adjust timing for staggered animation
        });
    }

    function renderSidebar(data) {
        const categories = {};
        const publishers = {};

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
        });

        const $sidebar = $('.sidebar');
        $sidebar.children('.sidebar-section').remove(); // Clear the sidebar

        // Create separate divs for categories and publishers with the sidebar-section class and data-title attributes
        const $categoriesSection = $('<div class="sidebar-section categories-section" data-title="Categories"></div>');
        const $publishersSection = $('<div class="sidebar-section publishers-section" data-title="Publishers"></div>');

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

        // Append sections to the sidebar
        $sidebar.append($categoriesSection);
        $sidebar.append($publishersSection);
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
        const downloadLink = item.downloadUrl || item.homepage;
        const homepageLink = item.homepage;

        // Create buttons div with conditional homepage button
        const $buttonsDiv = $('<div class="buttons"></div>');
        if (item.downloadUrl) {
            $buttonsDiv.append(`<a href="${downloadLink}" class="pricing-chip">Download</a>`);
        }
        if (homepageLink) {
            $buttonsDiv.append(`<a href="${homepageLink}" class="homepage-button">Visit Homepage</a>`);
        }

        const $expandedContent = $(`
            <div class="expanded-item">
                <div class="expanded-header">
                    <img src="${iconUrl}" alt="${item.name}">
                    <div class="info">
                        <h3>${item.name}</h3> <!-- Removed the link -->
                        <div class="publisher-badge">${item.publisher || 'Unknown'}</div>
                        ${$buttonsDiv.prop('outerHTML')}
                    </div>
                </div>
                <div class="compatibility">${$compatibility.html()}</div>
                <p>${item.description}</p>
                <div class="categories">
                    ${item.categories.map(category => `<div class="category-chip" data-category="${category}">${category}</div>`).join('')}
                </div>
            </div>
        `);

        $('#expanded-view').html($expandedContent).removeClass('hidden');
    }

});
