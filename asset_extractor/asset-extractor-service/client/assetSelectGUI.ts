const licenseTypes: Array<string> = [ "0BSD","AAL","Abstyles","AdaCore-doc","Adobe-2006","Adobe-Glyph","ADSL",
    ",AFL-1.1","AFL-1.2","AFL-2.0","AFL-2.1","AFL-3.0","Afmparse","AGPL-1.0-only",
    "AGPL-1.0-or-later","AGPL-3.0-only","AGPL-3.0-or-later","Aladdin","AMDPLPA",
    "AML","AMPAS","ANTLR-PD","ANTLR-PD-fallback","Apache-1.0","Apache-1.1",
    "Apache-2.0","APAFML","APL-1.0","App-s2p","APSL-1.0","APSL-1.1","APSL-1.2",
    "APSL-2.0","Arphic-1999","Artistic-1.0","Artistic-1.0-cl8","Artistic-1.0-Perl",
    "Artistic-2.0","ASWF-Digital-Assets-1.0","ASWF-Digital-Assets-1.1","Baekmuk",
    "Bahyph","Barr","Beerware","Bitstream-Charter","Bitstream-Vera",
    "BitTorrent-1.0","BitTorrent-1.1","blessing","BlueOak-1.0.0","Boehm-GC","Borceux",
    "Brian-Gladman-3-Clause","BSD-1-Clause","BSD-2-Clause","BSD-2-Clause-Patent",
    "BSD-2-Clause-Views","BSD-3-Clause","BSD-3-Clause-Attribution",
    "BSD-3-Clause-Clear","BSD-3-Clause-LBNL","BSD-3-Clause-Modification",
    "BSD-3-Clause-No-Military-License","BSD-3-Clause-No-Nuclear-License",
    "BSD-3-Clause-No-Nuclear-License-2014","BSD-3-Clause-No-Nuclear-Warranty",
    "BSD-3-Clause-Open-MPI","BSD-4-Clause","BSD-4-Clause-Shortened","BSD-4-Clause-UC",
    "BSD-4.3RENO","BSD-4.3TAHOE","BSD-Advertising-Acknowledgement","BSD-Protection",
    "BSD-Source-Code","BSL-1.0","BUSL-1.1","bzip2-1.0.6","C-UDA-1.0","CAL-1.0",
    "CAL-1.0-Combined-Work-Exception","Caldera","CATOSL-1.1","CC-BY-1.0","CC-BY-2.0",
    "CC-BY-2.5","CC-BY-2.5-AU","CC-BY-3.0","CC-BY-3.0-AT","CC-BY-3.0-DE",
    "CC-BY-3.0-IGO","CC-BY-3.0-NL","CC-BY-3.0-US","CC-BY-4.0","CC-BY-NC-1.0",
    "CC-BY-NC-2.0","CC-BY-NC-2.5","CC-BY-NC-3.0","CC-BY-NC-3.0-DE","CC-BY-NC-4.0",
    "CC-BY-NC-ND-1.0","CC-BY-NC-ND-2.0","CC-BY-NC-ND-2.5","CC-BY-NC-ND-3.0",
    "CC-BY-NC-ND-3.0-DE","CC-BY-NC-ND-3.0-IGO","CC-BY-NC-ND-4.0","CC-BY-NC-SA-1.0",
    "CC-BY-NC-SA-2.0","CC-BY-NC-SA-2.0-DE","CC-BY-NC-SA-2.0-FR","CC-BY-NC-SA-2.0-UK",
    "CC-BY-NC-SA-2.5","CC-BY-NC-SA-3.0","CC-BY-NC-SA-3.0-DE","CC-BY-NC-SA-3.0-IGO",
    "CC-BY-NC-SA-4.0","CC-BY-ND-1.0","CC-BY-ND-2.0","CC-BY-ND-2.5","CC-BY-ND-3.0",
    "CC-BY-ND-3.0-DE","CC-BY-ND-4.0","CC-BY-SA-1.0","CC-BY-SA-2.0","CC-BY-SA-2.0-UK",
    "CC-BY-SA-2.1-JP","CC-BY-SA-2.5","CC-BY-SA-3.0","CC-BY-SA-3.0-AT","CC-BY-SA-3.0-DE",
    "CC-BY-SA-3.0-IGO","CC-BY-SA-4.0","CC-PDDC","CC0-1.0","CDDL-1.0","CDDL-1.1",
    "CDL-1.0","CDLA-Permissive-1.0","CDLA-Permissive-2.0","CDLA-Sharing-1.0",
    "CECILL-1.0","CECILL-1.1","CECILL-2.0","CECILL-2.1","CECILL-B","CECILL-C",
    "CERN-OHL-1.1","CERN-OHL-1.2","CERN-OHL-P-2.0","CERN-OHL-S-2.0","CERN-OHL-W-2.0",
    "CFITSIO","checkmk","ClArtistic","Clips","CMU-Mach","CNRI-Jython","CNRI-Python",
    "CNRI-Python-GPL-Compatible","COIL-1.0","Community-Spec-1.0","Condor-1.1",
    "copyleft-next-0.3.0","copyleft-next-0.3.1","Cornell-Lossless-JPEG","CPAL-1.0",
    "CPL-1.0","CPOL-1.02","Crossword","CrystalStacker","CUA-OPL-1.0","Cube","curl",
    "D-FSL-1.0","diffmark","DL-DE-BY-2.0","DOC","Dotseqn","DRL-1.0","DSDP","dtoa",
    "dvipdfm","ECL-1.0","ECL-2.0","EFL-1.0","EFL-2.0","eGenix","Elastic-2.0",
    "Entessa","EPICS","EPL-1.0","EPL-2.0","ErlPL-1.1","etalab-2.0","EUDatagrid",
    "EUPL-1.0","EUPL-1.1","EUPL-1.2","Eurosym","Fair","FDK-AAC","Frameworx-1.0",
    "FreeBSD-DOC","FreeImage","FSFAP","FSFUL","FSFULLR","FSFULLRWD","FTL","GD",
    "GFDL-1.1-invariants-only","GFDL-1.1-invariants-or-later","GFDL-1.1-no-invariants-only",
    "GFDL-1.1-no-invariants-or-later","GFDL-1.1-only","GFDL-1.1-or-later",
    "GFDL-1.2-invariants-only","GFDL-1.2-invariants-or-later","GFDL-1.2-no-invariants-only",
    "GFDL-1.2-no-invariants-or-later","GFDL-1.2-only","GFDL-1.2-or-later",
    "GFDL-1.3-invariants-only","GFDL-1.3-invariants-or-later","GFDL-1.3-no-invariants-only",
    "GFDL-1.3-no-invariants-or-later","GFDL-1.3-only","GFDL-1.3-or-later","Giftware",
    "GL2PS","Glide","Glulxe","GLWTPL","gnuplot","GPL-1.0-only","GPL-1.0-or-later",
    "GPL-2.0-only","GPL-2.0-or-later","GPL-3.0-only","GPL-3.0-or-later",
    "Graphics-Gems","gSOAP-1.3b","HaskellReport","Hippocratic-2.1","HP-1986","HPND",
    "HPND-export-US","HPND-Markus-Kuhn","HPND-sell-variant","HPND-sell-variant-MIT-disclaimer",
    "HTMLTIDY","IBM-pibs","ICU","IEC-Code-Components-EULA","IJG","IJG-short",
    "ImageMagick","iMatix","Imlib2","Info-ZIP","Inner-Net-2.0","Intel","Intel-ACPI",
    "Interbase-1.0","IPA","IPL-1.0","ISC","Jam","JasPer-2.0","JPL-image","JPNIC",
    "JSON","Kazlib","Knuth-CTAN","LAL-1.2","LAL-1.3","Latex2e","Latex2e-translated-notice",
    "Leptonica","LGPL-2.0-only","LGPL-2.0-or-later","LGPL-2.1-only","LGPL-2.1-or-later",
    "LGPL-3.0-only","LGPL-3.0-or-later","LGPLLR","Libpng","libpng-2.0",
    "libselinux-1.0","libtiff","libutil-David-Nugent","LiLiQ-P-1.1","LiLiQ-R-1.1",
    "LiLiQ-Rplus-1.1","Linux-man-pages-1-para","Linux-man-pages-copyleft",
    "Linux-man-pages-copyleft-2-para","Linux-man-pages-copyleft-var","Linux-OpenIB","LOOP",
    "LPL-1.0","LPL-1.02","LPPL-1.0","LPPL-1.1","LPPL-1.2","LPPL-1.3a","LPPL-1.3c",
    "LZMA-SDK-9.11-to-9.20","LZMA-SDK-9.22","MakeIndex","Martin-Birgmeier","metamail",
    "Minpack","MirOS","MIT","MIT-0","MIT-advertising","MIT-CMU","MIT-enna",
    "MIT-feh","MIT-Festival","MIT-Modern-Variant","MIT-open-group","MIT-Wu","MITNFA",
    "Motosoto","mpi-permissive","mpich2","MPL-1.0","MPL-1.1","MPL-2.0",
    "MPL-2.0-no-copyleft-exception","mplus","MS-LPL","MS-PL","MS-RL","MTLL",
    "MulanPSL-1.0","MulanPSL-2.0","Multics","Mup","NAIST-2003","NASA-1.3","Naumen",
    "NBPL-1.0","NCGL-UK-2.0","NCSA","Net-SNMP","NetCDF","Newsletr","NGPL","NICTA-1.0",
    "NIST-PD","NIST-PD-fallback","NIST-Software","NLOD-1.0","NLOD-2.0","NLPL",
    "Nokia","NOSL","Noweb","NPL-1.0","NPL-1.1","NPOSL-3.0","NRL","NTP","NTP-0",
    "O-UDA-1.0","OCCT-PL","OCLC-2.0","ODbL-1.0","ODC-By-1.0","OFFIS","OFL-1.0",
    "OFL-1.0-no-RFN","OFL-1.0-RFN","OFL-1.1","OFL-1.1-no-RFN","OFL-1.1-RFN",
    "OGC-1.0","OGDL-Taiwan-1.0","OGL-Canada-2.0","OGL-UK-1.0","OGL-UK-2.0",
    "OGL-UK-3.0","OGTSL","OLDAP-1.1","OLDAP-1.2","OLDAP-1.3","OLDAP-1.4","OLDAP-2.0",
    "OLDAP-2.0.1","OLDAP-2.1","OLDAP-2.2","OLDAP-2.2.1","OLDAP-2.2.2","OLDAP-2.3",
    "OLDAP-2.4","OLDAP-2.5","OLDAP-2.6","OLDAP-2.7","OLDAP-2.8","OLFL-1.3","OML",
    "OpenPBS-2.3","OpenSSL","OPL-1.0","OPL-UK-3.0","OPUBL-1.0","OSET-PL-2.1",
    "OSL-1.0","OSL-1.1","OSL-2.0","OSL-2.1","OSL-3.0","Parity-6.0.0","Parity-7.0.0",
    "PDDL-1.0","PHP-3.0","PHP-3.01","Plexus","PolyForm-Noncommercial-1.0.0",
    "PolyForm-Small-Business-1.0.0","PostgreSQL","PSF-2.0","psfrag","psutils",
    "Python-2.0","Python-2.0.1","Qhull","QPL-1.0","QPL-1.0-INRIA-2004","Rdisc",
    "RHeCos-1.1","RPL-1.1","RPL-1.5","RPSL-1.0","RSA-MD","RSCPL","Ruby","SAX-PD",
    "Saxpath","SCEA","SchemeReport","Sendmail","Sendmail-8.23","SGI-B-1.0",
    "SGI-B-1.1","SGI-B-2.0","SGP4","SHL-0.5","SHL-0.51","SimPL-2.0","SISSL",
    "SISSL-1.2","Sleepycat","SMLNJ","SMPPL","SNIA","snprintf","Spencer-86",
    "Spencer-94","Spencer-99","SPL-1.0","SSH-OpenSSH","SSH-short","SSPL-1.0",
    "SugarCRM-1.1.3","SunPro","SWL","Symlinks","TAPR-OHL-1.0","TCL","TCP-wrappers",
    "TermReadKey","TMate","TORQUE-1.1","TOSL","TPDL","TPL-1.0","TTWL",
    "TU-Berlin-1.0","TU-Berlin-2.0","UCAR","UCL-1.0","Unicode-DFS-2015",
    "Unicode-DFS-2016","Unicode-TOU","UnixCrypt","Unlicense","UPL-1.0","Vim",
    "VOSTROM","VSL-1.0","W3C","W3C-19980720","W3C-20150513","w3m","Watcom-1.0",
    "Widget-Workshop","Wsuipa","WTFPL","X11","X11-distribute-modifications-variant",
    "Xdebug-1.03","Xerox","Xfig","XFree86-1.1","xinetd","xlock","Xnet","xpp",
    "XSkat","YPL-1.0","YPL-1.1","Zed","Zend-2.0","Zimbra-1.3","Zimbra-1.4","Zlib",
    "zlib-acknowledgement","ZPL-1.1","ZPL-2.0","ZPL-2.1"];

function creatLicenseTypeSelect (licenseTypeDiv : HTMLElement): HTMLSelectElement{

    const licenseDropdownMenu = document.createElement('select');
    licenseDropdownMenu.id = 'licenseTypeSelect';
    licenseDropdownMenu.required = true;

    //first element (dummy)
    const placeholderOption = document.createElement('option');
    placeholderOption.text = "Select license type";
    placeholderOption.value = "";    
    placeholderOption.disabled = true;
    placeholderOption.selected = true;                   
    licenseDropdownMenu.add(placeholderOption);

    for(const mediaType of licenseTypes){
        const option = document.createElement('option');
        option.text = option.value = mediaType;
        licenseDropdownMenu.add(option);
    }

    licenseTypeDiv?.appendChild(licenseDropdownMenu);
    return licenseDropdownMenu;
}

interface MediaType {
    value: string;
    text: string;
    type: string;
}

function creatMediaTypeSelect (mediaTypeDiv : HTMLElement, mediaTypes : MediaType[]){
    
    const mediaFileLabel = document.createElement('label');
    mediaFileLabel.textContent = "Add data file";
    mediaFileLabel.id = 'mediaFileLabel';
    mediaTypeDiv?.appendChild(mediaFileLabel);

    const mediaDropdownMenu = document.createElement('select');
    mediaDropdownMenu.id = 'mediaTypeSelect';
    mediaDropdownMenu.required = false;

    const placeholderOption = document.createElement('option');
    placeholderOption.text = "Select media type";
    placeholderOption.value = "";    
    placeholderOption.disabled = true;
    placeholderOption.selected = true;                   
    mediaDropdownMenu.add(placeholderOption);

    for(const mediaType of mediaTypes){
        const option = document.createElement('option');
        option.text = mediaType.text;
        option.value = mediaType.value;  
        mediaDropdownMenu.add(option);
    }

    mediaTypeDiv?.appendChild(mediaDropdownMenu);
    return mediaDropdownMenu;
}

async function createGUI() {
    try {     

        const resetLicenseFileButton = document.getElementById('resetLicenseFile') as HTMLButtonElement;
        const licenseFileInput = document.getElementById('License') as HTMLInputElement;
        if (resetLicenseFileButton && licenseFileInput) {
            resetLicenseFileButton.addEventListener('click', () => {
                licenseFileInput.value = '';  //reset the license file input upon request
            });
        }

        const licenseTypeDiv = document.getElementById('licenseType') as HTMLElement;
        const licenseDropdownMenu = creatLicenseTypeSelect(licenseTypeDiv);
         // Trigger adding the license type to the form when selected
         licenseDropdownMenu.addEventListener('change', () => {
            const selectedLicenseType = licenseDropdownMenu.value;

            if (!selectedLicenseType) {
                alert('Please select a license type.');
                return;
            }

            const hiddenInput = document.getElementById('selectedLicenseTypeInput') as HTMLInputElement;
            hiddenInput.value = selectedLicenseType;
        });

        //just create result container inside the output division for the results to be listed there (need a parent div for result container to implement css fronnt end properly)
        const outputDiv = document.getElementById('outputDiv');
        const resultContainer = document.createElement('div');
        resultContainer.id = "resultContainer";
        outputDiv?.appendChild(resultContainer);

        const mediaTypes: MediaType[] = [
            { value: 'Document', text: 'Document', type: '.txt,.pdf,.md' },
            { value: 'Metadata', text: 'Metadata', type: '.json' },
            { value: 'Service', text: 'Service', type: '.bjson' },
            { value: 'Validation', text: 'Validation', type: '.xqar,.txt' },
            { value: 'Image', text: 'Image', type: '.png,.jpg' },
            { value: 'Routing', text: 'Routing', type: '.geojson' },
            { value: 'Video', text: 'Video', type: '.mp4' },
            { value: '3DPreview', text: '3DPreview', type: '.json' }
        ];
        const mediaContainer = document.getElementById('mediaContainer') as HTMLElement;
        const mediaTypeDiv = document.getElementById('mediaType') as HTMLElement;
        const mediaDropdownMenu = creatMediaTypeSelect(mediaTypeDiv,mediaTypes);    
        
        // Function to add a new media file input based on selected media type
        function addMediaInput(mediaType : MediaType) {
            const mediaDiv = document.createElement('div');
            mediaDiv.className = 'media-input'; // Apply the grid class
            
            // Label
            const mediaFileLabel = document.createElement('label');
            mediaFileLabel.textContent = `${mediaType.text}`;
            mediaDiv.appendChild(mediaFileLabel);
            
            // Input
            const mediaFileInput = document.createElement('input');
            mediaFileInput.type = 'file';
            mediaFileInput.name = `${mediaType.value}`;
            mediaFileInput.accept = mediaType.type;
            mediaFileInput.required = true;
            mediaDiv.appendChild(mediaFileInput);
            
            // Remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'x';
            mediaDiv.appendChild(removeButton);
            
            // Add the new media input to the container
            mediaContainer.appendChild(mediaDiv);
            
            // Remove functionality
            removeButton.addEventListener('click', function() {
                mediaContainer.removeChild(mediaDiv);
            });
        }
        
        // Trigger addMediaInput when a media type is selected
        mediaDropdownMenu.addEventListener('change', () => {
            const selectedValue = mediaDropdownMenu.value;

            if (!selectedValue) {
                alert('Please select a media type.');
                return;
            }

            // Find the selected media type in the mediaTypes array
            const selectedMediaType = mediaTypes.find(media => media.value === selectedValue);
            if (selectedMediaType) {
                addMediaInput(selectedMediaType);
            }

            // reset the dropdown to the placeholder option so that clicking the same option again fires the "change",event
            mediaDropdownMenu.value = "";
        });
    } catch (error) {
        console.error('Error creating GUI:', error);
    }
}
document.addEventListener('DOMContentLoaded', createGUI);