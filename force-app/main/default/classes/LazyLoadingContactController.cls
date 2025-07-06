//LazyLoadingContactController.apex
public class LazyLoadingContactController {
    @AuraEnabled
    public static List<Contact> getContactsData(Integer limitSize, Integer offset) {
        return [
            SELECT Id, FirstName,LastName, Email
            FROM Contact WHERE Name Like 'E%'
            ORDER BY Name 
            LIMIT :limitSize 
            OFFSET :offset
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getAllContacts() {
        return [
            SELECT Id, FirstName,LastName, Email
            FROM Contact WHERE Name Like 'E%' LIMIT 1000];
    }
}