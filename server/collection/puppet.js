function findHeaderRow(row) {
    const tbody = row.parentNode.parentNode.childNodes[1];
    const validCellCount = row.childNodes.length;
    
    return Array.from(tbody.childNodes).find((r, idx) => {
        if (r.childNodes.length !== validCellCount) return false;
        if (r.childNodes[1].innerText.length === 0) return false;
        if (idx === 0) return false;
        return true;
    });
}

function acquireLinks() {
    const links = Array.from(document.querySelectorAll('a')).filter(link => link.innerText === 'download link');
    return links.map(link => {
        const rawUrl = link.getAttribute('href');
        const row = link.parentNode.parentNode
        const fields = Array.from(findHeaderRow(row).childNodes).map(c => c.innerText);
        const out = {
            url: rawUrl.substr(0, rawUrl.indexOf('&sa=')).replace('https://www.google.com/url?q=', ''),
            folder_links: [],
            metadata: { },
            resolve_status: null
        };
        
        if (out.url.substr(out.url.length - 5) === '/file') out.url = out.url.substr(0, out.url.length - 5);
        
        fields.forEach((field, idx) => {
            if (['2', 'download link', 'setlist', 'kbps', 'stream link', '4'].includes(field.toLowerCase().trim())) return;
            out.metadata[field.toLowerCase()] = row.childNodes[idx].innerText;
        });
        if (!out.metadata.date) out.metadata.date = '';
        if (!out.metadata.sbd) out.metadata.sbd = '';
        if (out.metadata.date.includes('1998') && out.metadata.hasOwnProperty('')) {
            out.metadata.source = out.metadata[''];
            delete out.metadata[''];
        }
        
        return out;
    });
}

async function process_links(links, resolve) {
    const mudratDetectors = [
        {
            collection: 'mediafire_good',
            test: (url) => {
                return url.includes('mediafire') && (url.includes('/file_premium/') || url.includes('/file/') || url.includes('/download/'));
            }
        },
        {
            collection: 'mediafire_folders',
            test: (url) => {
                return url.includes('mediafire') && !(url.includes('/file/') || url.includes('/download/'));
            }
        },
        {
            collection: 'mega',
            test: (url) => {
                return url.includes('://mega');
            }
        },
        {
            collection: 'soundcloud',
            test: (url) => {
                return url.includes('://soundcloud');
            }
        },
        {
            collection: 'other',
            test: (url) => true
        }
    ];
    const collections = {
        mediafire_good: [],
        mediafire_folders: [],
        mega: [],
        soundcloud: [],
        other: []
    };
    
    links.forEach(link => {
        const detector = mudratDetectors.find(detector => detector.test(link.url));
        collections[detector.collection].push(link);
    });
    
    resolve({ error: null, data: collections });
}

function process(resolve) {
    try {
        const links = acquireLinks();
        process_links(links, resolve);
    } catch (error) {
        resolve({ error, data: null });
    }
}

process(send_result);
