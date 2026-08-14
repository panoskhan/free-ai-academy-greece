# White-Label Academy Model

## Τι είναι
Το Free AI Academy Greece μπορεί να λειτουργεί και ως **white-label starter**: ένας εκπαιδευτής, σχολείο, κοινότητα, δήμος, nonprofit ή developer μπορεί να πάρει το template, να αλλάξει branding/content και να το φιλοξενήσει στο δικό του repository/server.

## Τι περιλαμβάνει το starter
- `builder/index.html` — browser-based Builder Studio.
- Live preview σε sandboxed iframe.
- Lightweight local tests για βασικά HTML/Greek/viewport/interaction/accessibility signals.
- Export ενός standalone HTML αρχείου.
- Μαθήματα και project structure που μπορούν να επεκταθούν.

## Προτεινόμενο μοντέλο
1. Fork/clone το repository.
2. Αλλάξτε όνομα, περιεχόμενο και branding.
3. Χρησιμοποιήστε το Builder για γρήγορο prototype.
4. Κάντε local/CI testing πριν το publish.
5. Deploy σε GitHub Pages ή δικό σας hosting.

## Important boundaries
Το Builder δεν εκτελεί αυθαίρετο server-side code και δεν πρέπει να χρησιμοποιείται για secrets. Το preview είναι sandboxed και τα tests είναι βασικοί smoke checks, όχι πλήρης security audit.

Για production white-label installations χρειάζονται επιπλέον: πραγματικό test suite, accessibility audit, dependency/security scanning, privacy review και server-side systems μόνο όταν απαιτούνται.

## License / branding
Πριν δημιουργηθεί επίσημη άδεια για επαναχρησιμοποίηση, ο ιδιοκτήτης του repository πρέπει να επιλέξει και να προσθέσει explicit open-source license και κανόνες χρήσης του Academy branding. Το template δεν πρέπει να παρουσιάζεται ως επίσημη κρατική ή διαπιστευμένη εκπαιδευτική υπηρεσία χωρίς σχετική εξουσιοδότηση.
