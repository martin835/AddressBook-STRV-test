Project description
Design & Implement a RESTful API for an AddressBook application. The AddressBook app enables users to register and manage their own contact list by adding contacts to Firebase.
API should serve all kinds of clients (which you do not have to implement)—both mobile apps and websites using a RESTful API. The AddressBook API backend should use two different storage services to maintain the data. User accounts are stored in either an SQL database or a NoSQL database of your choice, whereas contacts are stored in Firebase. 


Features Overview
Register new account
Log in to the created account
Adding a contact to Firebase

Register new account
All users should be stored in persistent DB.
Registrations should be done with email + password.
No other user information besides email & password is needed.
After registration, the user should be automatically logged in.

Log in to account
Users should be able to log in using email & password.
Use stateless authorization (JWT).

Adding a contact		
Logged in users should be able to add a new contact.
Contact should contain the following information:
First name
Last name
Phone number
Address (text)


Save contact to Firebase only.

Listing contacts
You don’t need to implement a listing of contacts.
Clients will connect directly to Firebase to read contacts. Make sure Firebase is safely configured.
