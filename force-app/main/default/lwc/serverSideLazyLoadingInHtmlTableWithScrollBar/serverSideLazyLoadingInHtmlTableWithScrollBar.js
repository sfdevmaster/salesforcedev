/*serverSideLazyLoadingInHtmlTableWithScrollBar.js*/
import { LightningElement, track, api } from 'lwc';
import getContacts from '@salesforce/apex/LazyLoadingContactController.getContactsData';

export default class ServerSideLazyLoadingInHtmlTableWithScrollBar extends LightningElement {
    @track contacts = [];
    @api pageSize = 5;
    offset = 0;
    isLoading = false;
    hasMoreRecords = true;

    connectedCallback() {
        this.loadInitialData();
    }

    async loadInitialData() {
        if (!this.hasMoreRecords || this.isLoading) return;
        this.isLoading = true;
        try {
            // Simulate a delay for loading
            await this.loadingDelay();
            const result = await getContacts({ limitSize: this.pageSize, offset: this.offset });
            if (result.length > 0) {
                const newcontacts = this.processcontacts(result, this.contacts.length);
                this.contacts = [...this.contacts, ...newcontacts];
                this.offset += this.pageSize;
                this.hasMoreRecords = result.length === this.pageSize;
                this.setScrollableHeight();
            } else {
                this.hasMoreRecords = false;
            }
            //this.updateScrollableHeight();
        } catch (error) {
            console.error('Error loading more contacts:', error);
        } finally {
            this.isLoading = false;
        }
    }

    loadingDelay() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        return new Promise((resolve) => setTimeout(resolve, 1000));
    }

    async loadMoreData() {
        this.loadInitialData();
    }

    get allLoaded() {
        return !this.hasMoreRecords && this.contacts.length > 0;
    }

    processcontacts(contacts, currentLength) {
        // Add serial number to each contact
        return contacts.map((contact, index) => ({
            ...contact,
            serialNumber: currentLength + index + 1, // Calculate serial number
        }));
    }

    handleScroll() {
        const buffer = 10;
        const scrollableContainer = this.template.querySelector('.scrollable');
        if (!scrollableContainer) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;
        if (scrollHeight - scrollTop - clientHeight < buffer && !this.isLoading) {
            this.loadMoreData();
        }
        const backToTopButton = this.template.querySelector('.back-to-top');
        if (scrollTop > 20) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    }

    scrollToTop() {
        const scrollableContainer = this.template.querySelector('.scrollable');
        if (scrollableContainer) {
            scrollableContainer.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }

    setScrollableHeight() {
        const scrollableContainer = this.template.querySelector('.scrollable');
        if (scrollableContainer) {
            // Approximate height of each row in pixels
            const rowHeight = 36;
            // Total height based on pageSize
            const calculatedHeight = this.pageSize * rowHeight;
            scrollableContainer.style.height = `${calculatedHeight}px`;
        }
    }
}