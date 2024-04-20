type WebsiteData = {
    hostSuffix: string;
};
export declare class NavigationHandler {
    private readonly websitesData;
    private readonly chrome;
    constructor(websitesData: WebsiteData[], chrome: any);
    generateAmazonAffiliateLink(url: string, affiliateId: string): Promise<string>;
    handleNavigation(details: any): Promise<void>;
    private getAffiliateIdForWebsite;
    private generateGeniusAffiliateLink;
    private generateAffiliateLink;
    private redirectUser;
}
export declare const websitesData: WebsiteData[];
export {};
