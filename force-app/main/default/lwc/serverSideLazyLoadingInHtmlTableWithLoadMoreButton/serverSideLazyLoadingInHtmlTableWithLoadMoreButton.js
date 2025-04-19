/*serverSideLazyLoadingInHtmlTableWithLoadMoreButton.js*/
import { LightningElement, track, api } from 'lwc';
import getContacts from '@salesforce/apex/LazyLoadingContactController.getContactsData';

export default class ServerSideLazyLoadingInHtmlTableWithLoadMoreButton extends LightningElement {
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
                const newContacts = this.processContacts(result, this.contacts.length);
                this.contacts = [...this.contacts, ...newContacts];
                this.offset += this.pageSize;
                this.hasMoreRecords = result.length === this.pageSize;
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

    async handleLoadMore() {
        this.loadInitialData();
        this.handleScrollEvent();
    }

    handleScrollEvent() {
        window.addEventListener('scroll', () => {
            const backToTopButton = this.template.querySelector('.back-to-top');
            if (window.scrollY > 20) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
    }
    
    get allLoaded() {
        return !this.hasMoreRecords && this.contacts.length > 0;
    }

    processContacts(contacts, currentLength) {
        return contacts.map((contact, index) => ({
            ...contact,
            serialNumber: currentLength + index + 1,
        }));
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    updateScrollableHeight() {
        const scrollableContainer = this.template.querySelector('.scrollable');
        if (scrollableContainer) {
            // Approximate height of each row
            const rowHeight = 34;
            const totalHeight = this.contacts.length * rowHeight;
            scrollableContainer.style.height = `${totalHeight}px`;
        }
    }
}