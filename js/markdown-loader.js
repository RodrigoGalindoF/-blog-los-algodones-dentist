// Markdown Loader and Parser
class MarkdownLoader {
    constructor() {
        this.markdownContent = '';
        this.blogMetadata = {};
        // Image mapping for Los Algodones blog post
        this.imageMapping = {
            'image2': '2_map-andrade-port-of-entry-los-algodones-dentists.webp',
            'image3': '3_molar-city-los-algodones-dental-stats.webp',
            'image4': '4_los-algodones-history-dental-frontier-timeline.webp',
            'image5': '5_los-algodones-dentist-advanced-care-equipment.webp',
            'image6': '6_los-algodones-dental-treatments-implants-veneers.webp',
            'image7': '7_los-algodones-dental-crown-procedure.webp',
            'image8': '8_los-algodones-dental-implant-diagram.webp',
            'image9': '9_los-algodones-porcelain-veneers-before-after.webp',
            'image10': '10_choose-quality-los-algodones-dental-clinic-guide.webp',
            'image11': '11_map-los-algodones-mexico-andrade-port-of-entry.webp',
            'image12': '12_los-algodones-border-crossing-dentist-options.webp',
            'image13': '13_entering-mexico-los-algodones-land-border-fmm.webp',
            'image14': '14_walking-map-us-customs-los-algodones-dentists.webp',
            'image15': '15_us-customs-checklist-los-algodones-dental-trip.webp',
            'image16': '16_navigating-molar-city-los-algodones-dental-tourism.webp',
            'image17': '17_los-algodones-hotels-dental-tourism-mexico.webp',
            'image18': '18_best-time-to-visit-los-algodones-dentist-weather.webp',
            'image19': '19_shopping-los-algodones-mexico-dental-visit.webp',
            'image20': '20_safety-in-los-algodones-mexico-dentist.webp'
        };
    }

    // Fetch markdown file
    async loadMarkdownFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load markdown file: ${response.status}`);
            }
            this.markdownContent = await response.text();
            return this.markdownContent;
        } catch (error) {
            console.error('Error loading markdown file:', error);
            throw error;
        }
    }

    // Generate meaningful alt text from image filename
    generateAltText(filename) {
        // Remove file extension and number prefix
        let altText = filename.replace(/^\d+_/, '').replace(/\.webp$/, '');
        
        // Replace hyphens with spaces and capitalize words
        altText = altText.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return altText;
    }

    // Helper method to parse inline formatting
    parseInlineFormatting(text) {
        let formatted = text;
        
        // First, handle links to avoid conflicts with other formatting
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Convert inline code (before other formatting to protect it)
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert bold text (handle multiple asterisks) - improved to handle nested content
        formatted = formatted.replace(/\*\*\*\*(.*?)\*\*\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert italic text (avoid conflicts with bold)
        formatted = formatted.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
        formatted = formatted.replace(/_([^_\n]+?)_/g, '<em>$1</em>');

        // Convert strikethrough
        formatted = formatted.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        return formatted;
    }

    // Simple markdown to HTML converter
    parseMarkdown(markdown) {
        // Remove image references at the end of the content (including base64 data)
        markdown = markdown.replace(/\[image\d+\]:\s*<data:image\/[^>]+>\n?/g, '');
        markdown = markdown.replace(/\[image\d+\]:\s*.*?\n/g, '');
        
        let html = markdown;

        // Convert headers (improved to handle bold headers properly)
        html = html.replace(/^#### \*{0,4}(.*?)\*{0,4}$/gim, '<h4>$1</h4>');
        html = html.replace(/^### \*{0,4}(.*?)\*{0,4}$/gim, '<h3>$1</h3>');
        html = html.replace(/^## \*{0,4}(.*?)\*{0,4}$/gim, '<h2>$1</h2>');
        html = html.replace(/^# \*{0,4}(.*?)\*{0,4}$/gim, '<h1>$1</h1>');

        // Convert images (handle both standard and reference-style images)
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="blog-image" style="width: 100%; height: auto; margin: 20px 0;">');
        
        // Handle reference-style images with mapping
        html = html.replace(/!\[\]\[([^\]]+)\]/g, (match, imageName) => {
            // Remove "Image: image1" permanently
            if (imageName === 'image1') {
                return '';
            }
            
            // Check if we have a mapping for this image
            if (this.imageMapping[imageName]) {
                const imageFile = this.imageMapping[imageName];
                const altText = this.generateAltText(imageFile);
                return `<img src="Webp/${imageFile}" alt="${altText}" class="blog-image" style="width: 100%; height: auto; margin: 20px 0;" onerror="this.style.display='none'; console.warn('Image not found: Webp/${imageFile}');">`;
            } else {
                // Keep as placeholder if no mapping exists, but hide it by default
                console.warn(`No mapping found for image: ${imageName}`);
                return `<div class="image-placeholder" style="display: none; background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; color: #666;">Image: ${imageName}</div>`;
            }
        });

        // Convert blockquotes (improved)
        html = html.replace(/^> (.+)$/gim, (match, content) => {
            return `<blockquote class="mobile-blockquote"><p>${this.parseInlineFormatting(content)}</p></blockquote>`;
        });

        // Convert horizontal rules
        html = html.replace(/^---$/gim, '<hr class="mobile-hr">');
        html = html.replace(/^\*\*\*$/gim, '<hr class="mobile-hr">');

        // Split into blocks for better processing
        const blocks = html.split(/\n\s*\n/);
        const processedBlocks = [];

        for (let block of blocks) {
            block = block.trim();
            if (block === '') continue;

            // Skip if already processed as header, blockquote, or hr
            if (block.match(/^<(h[1-6]|blockquote|hr)/)) {
                processedBlocks.push(block);
                continue;
            }

            // Handle ordered lists (improved)
            if (block.match(/^\d+\.\s/m)) {
                const lines = block.split('\n');
                let listHtml = '<ol class="mobile-list">';
                let currentItem = '';
                let inList = false;
                
                for (let line of lines) {
                    line = line.trim();
                    const orderedMatch = line.match(/^(\d+)\.\s(.+)$/);
                    
                    if (orderedMatch) {
                        // If we have a previous item, close it
                        if (currentItem) {
                            listHtml += `<li>${this.parseInlineFormatting(currentItem.trim())}</li>`;
                        }
                        // Start new item
                        currentItem = orderedMatch[2];
                        inList = true;
                    } else if (line && inList) {
                        // Continue previous list item (multi-line content)
                        // Add a space if the current item doesn't end with punctuation
                        const needsSpace = currentItem && !/[.!?:;,]$/.test(currentItem.trim());
                        currentItem += (needsSpace ? ' ' : ' ') + line;
                    }
                }
                
                // Close the last item
                if (currentItem) {
                    listHtml += `<li>${this.parseInlineFormatting(currentItem.trim())}</li>`;
                }
                
                listHtml += '</ol>';
                processedBlocks.push(listHtml);
                continue;
            }

            // Handle unordered lists (improved)
            if (block.match(/^[-*+]\s/m)) {
                const lines = block.split('\n');
                let listHtml = '<ul class="mobile-list">';
                let currentItem = '';
                let inList = false;
                
                for (let line of lines) {
                    line = line.trim();
                    const unorderedMatch = line.match(/^[-*+]\s(.+)$/);
                    
                    if (unorderedMatch) {
                        // If we have a previous item, close it
                        if (currentItem) {
                            listHtml += `<li>${this.parseInlineFormatting(currentItem.trim())}</li>`;
                        }
                        // Start new item
                        currentItem = unorderedMatch[1];
                        inList = true;
                    } else if (line && inList) {
                        // Continue previous list item (multi-line content)
                        // Add a space if the current item doesn't end with punctuation
                        const needsSpace = currentItem && !/[.!?:;,]$/.test(currentItem.trim());
                        currentItem += (needsSpace ? ' ' : ' ') + line;
                    }
                }
                
                // Close the last item
                if (currentItem) {
                    listHtml += `<li>${this.parseInlineFormatting(currentItem.trim())}</li>`;
                }
                
                listHtml += '</ul>';
                processedBlocks.push(listHtml);
                continue;
            }

            // Handle code blocks
            if (block.startsWith('```')) {
                const codeMatch = block.match(/```(\w+)?\n?([\s\S]*?)```/);
                if (codeMatch) {
                    const language = codeMatch[1] || '';
                    const code = codeMatch[2];
                    processedBlocks.push(`<pre><code class="language-${language}">${code}</code></pre>`);
                    continue;
                }
            }

            // Handle tables (improved with inline formatting)
            if (block.includes('|')) {
                const lines = block.split('\n');
                if (lines.length >= 2 && lines[1].includes('---')) {
                    let tableHtml = '<table><thead><tr>';
                    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
                    headers.forEach(header => {
                        tableHtml += `<th>${this.parseInlineFormatting(header)}</th>`;
                    });
                    tableHtml += '</tr></thead><tbody>';
                    
                    for (let i = 2; i < lines.length; i++) {
                        const cells = lines[i].split('|').map(c => c.trim()).filter(c => c);
                        if (cells.length > 0) {
                            tableHtml += '<tr>';
                            cells.forEach(cell => {
                                tableHtml += `<td>${this.parseInlineFormatting(cell)}</td>`;
                            });
                            tableHtml += '</tr>';
                        }
                    }
                    
                    tableHtml += '</tbody></table>';
                    processedBlocks.push(tableHtml);
                    continue;
                }
            }

            // Handle regular paragraphs (improved)
            if (block && !block.startsWith('<')) {
                // Check if this block contains multiple logical paragraphs
                const lines = block.split('\n').map(line => line.trim()).filter(line => line);
                
                if (lines.length === 1) {
                    // Single line - simple paragraph
                    processedBlocks.push(`<p class="mobile-paragraph">${this.parseInlineFormatting(lines[0])}</p>`);
                } else {
                    // Multiple lines - check if they should be separate paragraphs or line breaks
                    let paragraphContent = '';
                    
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        
                        // If line looks like a continuation (starts with lowercase or common continuation words)
                        if (i > 0 && (
                            /^[a-z]/.test(line) || 
                            /^(and|or|but|the|a|an|in|on|at|to|for|of|with|by)/.test(line.toLowerCase()) ||
                            line.length < 50
                        )) {
                            paragraphContent += ' ' + line;
                        } else {
                            // Start new paragraph
                            if (paragraphContent) {
                                processedBlocks.push(`<p class="mobile-paragraph">${this.parseInlineFormatting(paragraphContent)}</p>`);
                            }
                            paragraphContent = line;
                        }
                    }
                    
                    // Add the last paragraph
                    if (paragraphContent) {
                        processedBlocks.push(`<p class="mobile-paragraph">${this.parseInlineFormatting(paragraphContent)}</p>`);
                    }
                }
            } else {
                processedBlocks.push(block);
            }
        }

        return processedBlocks.join('\n\n');
    }

    // Extract metadata from markdown content
    extractMetadata(markdown) {
        const lines = markdown.split('\n');
        const firstLine = lines[0];
        
        // Extract title from first header (remove bold formatting)
        const titleMatch = firstLine.match(/^#\s*\*?\*?(.*?)\*?\*?$/);
        let title = titleMatch ? titleMatch[1].trim() : 'Blog Post';
        
        // Clean up title (remove extra asterisks)
        title = title.replace(/\*+/g, '').trim();
        
        // Generate description from first substantial paragraph
        let description = '';
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && !line.startsWith('*') && line.length > 50) {
                // Clean up the description
                let cleanDesc = line.replace(/\*+/g, '').replace(/#+/g, '').trim();
                description = cleanDesc.substring(0, 160);
                if (cleanDesc.length > 160) {
                    description += '...';
                }
                break;
            }
        }
        
        // Determine category based on content
        let category = 'Dental Care';
        const content = markdown.toLowerCase();
        if (content.includes('los algodones') || content.includes('mexico')) {
            category = 'Dental Tourism';
        } else if (content.includes('travel') || content.includes('trip')) {
            category = 'Travel';
        }
        
        this.blogMetadata = {
            title: title,
            description: description || 'Comprehensive dental care information and guidance for patients seeking quality treatment.',
            category: category,
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };
        
        return this.blogMetadata;
    }

    // Update page metadata
    updatePageMetadata(metadata) {
        // Update page title
        document.title = metadata.title;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', metadata.description);
        }
        
        // Update Open Graph title
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', metadata.title);
        }
        
        // Update Open Graph description
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', metadata.description);
        }
        
        // Update blog post elements
        const blogTitle = document.querySelector('.blog-post-text-title-main');
        if (blogTitle) {
            blogTitle.textContent = metadata.title;
        }
        
        const blogCategory = document.querySelector('.blog-container-ind-tag');
        if (blogCategory) {
            blogCategory.textContent = metadata.category;
        }
        
        const blogDate = document.querySelector('.blog-container-ind-date');
        if (blogDate) {
            blogDate.textContent = metadata.date;
        }
        
        // Update cover image if needed
        this.updateCoverImage();
    }

    // Update cover image to use the Los Algodones cover image
    updateCoverImage() {
        const coverImage = document.querySelector('.blog-post-ind-image-main-card-copy');
        if (coverImage) {
            const newSrc = 'Webp/Cover-Image_los-algodones-dentist-senior-couple.webp';
            const newAlt = 'Los Algodones dentist with senior couple - dental tourism in Mexico';
            
            // Only update if it's not already set to the correct image
            if (!coverImage.src.includes('Cover-Image_los-algodones-dentist-senior-couple.webp')) {
                coverImage.src = newSrc;
                coverImage.alt = newAlt;
                console.log('Cover image updated to Los Algodones image');
            }
        }
    }

    // Main function to load and render markdown content
    async loadAndRenderBlog(markdownFilePath, contentContainerSelector) {
        try {
            console.log('Starting to load markdown file:', markdownFilePath);
            
            // Load markdown file
            const markdown = await this.loadMarkdownFile(markdownFilePath);
            console.log('Markdown loaded, length:', markdown.length);
            
            // Extract metadata
            const metadata = this.extractMetadata(markdown);
            console.log('Metadata extracted:', metadata);
            
            // Update page metadata
            this.updatePageMetadata(metadata);
            console.log('Page metadata updated');
            
            // Convert markdown to HTML
            console.log('Converting markdown to HTML...');
            const html = this.parseMarkdown(markdown);
            console.log('HTML generated, length:', html.length);
            
            // Insert HTML into the page
            const contentContainer = document.querySelector(contentContainerSelector);
            if (contentContainer) {
                contentContainer.innerHTML = html;
                console.log('Content inserted into container');
            } else {
                console.error('Content container not found:', contentContainerSelector);
                throw new Error('Content container not found: ' + contentContainerSelector);
            }
            
            return { html, metadata };
        } catch (error) {
            console.error('Error loading and rendering blog:', error);
            console.error('Error stack:', error.stack);
            
            // Fallback: show error message
            const contentContainer = document.querySelector(contentContainerSelector);
            if (contentContainer) {
                contentContainer.innerHTML = `<p style="color: red; text-align: center; padding: 40px;">Error loading blog content: ${error.message}<br>Please check the console for more details.</p>`;
            }
            
        }
    }
}

// Initialize and export
window.MarkdownLoader = MarkdownLoader; 