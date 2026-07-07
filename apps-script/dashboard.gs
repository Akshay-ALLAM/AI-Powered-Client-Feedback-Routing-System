const POSITIVE_SHEET = 'Positive Feedback';
const NEGATIVE_SHEET = 'Negative Feedback';
const DASHBOARD_SHEET = 'Dashboard';

function buildDashboard() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = getOrCreateSheet_(spreadsheet, DASHBOARD_SHEET);
  const positiveRows = getFeedbackRows_(spreadsheet, POSITIVE_SHEET);
  const negativeRows = getFeedbackRows_(spreadsheet, NEGATIVE_SHEET);
  const rows = positiveRows.concat(negativeRows);

  dashboard.clear();
  dashboard.getRange('A1').setValue('Client Feedback Dashboard');
  dashboard.getRange('A1:H1').merge();
  dashboard.getRange('A1').setFontWeight('bold').setFontSize(18);

  const ratings = rows.map(row => Number(row.Rating)).filter(rating => !Number.isNaN(rating));
  const total = rows.length;
  const urgent = ratings.filter(rating => rating <= 2).length;
  const watch = ratings.filter(rating => rating === 3).length;
  const good = ratings.filter(rating => rating >= 4).length;
  const average = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;

  const summary = [
    ['Metric', 'Value'],
    ['Total feedback', total],
    ['Positive feedback', positiveRows.length],
    ['Negative feedback', negativeRows.length],
    ['Urgent (1-2 stars)', urgent],
    ['Watch (3 stars)', watch],
    ['Good (4-5 stars)', good],
    ['Average rating', average ? average.toFixed(2) : 'N/A'],
  ];

  dashboard.getRange(3, 1, summary.length, summary[0].length).setValues(summary);
  dashboard.getRange(3, 1, 1, 2).setFontWeight('bold').setBackground('#e8f0fe');
  dashboard.getRange(4, 1, summary.length - 1, 2).setBorder(true, true, true, true, true, true);

  const headers = ['Name', 'Email', 'Rating', 'Sentiment', 'Problem', 'Solution', 'Risk Level', 'Priority'];
  const table = rows
    .sort((a, b) => Number(a.Rating) - Number(b.Rating))
    .map(row => headers.map(header => row[header] || ''));

  const startRow = 13;
  dashboard.getRange(startRow, 1, 1, headers.length).setValues([headers]);
  dashboard.getRange(startRow, 1, 1, headers.length).setFontWeight('bold').setBackground('#202124').setFontColor('#ffffff');

  if (table.length) {
    dashboard.getRange(startRow + 1, 1, table.length, headers.length).setValues(table);
    applyRatingColors_(dashboard, startRow + 1, table.length);
  }

  dashboard.autoResizeColumns(1, headers.length);
  dashboard.setFrozenRows(startRow);
}

function getOrCreateSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function getFeedbackRows_(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  return values.slice(1)
    .filter(row => row.some(value => value !== ''))
    .map(row => headers.reduce((record, header, index) => {
      record[header] = row[index];
      return record;
    }, {}));
}

function applyRatingColors_(sheet, firstDataRow, rowCount) {
  for (let offset = 0; offset < rowCount; offset += 1) {
    const row = firstDataRow + offset;
    const rating = Number(sheet.getRange(row, 3).getValue());
    const color = rating <= 2 ? '#fce8e6' : rating === 3 ? '#fff4ce' : '#e6f4ea';
    sheet.getRange(row, 1, 1, 8).setBackground(color);
  }
}
