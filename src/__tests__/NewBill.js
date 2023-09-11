/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the formular is shown", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const title = screen.getAllByText('Envoyer une note de frais');
      expect(title).toBeTruthy();
      const expense_type = screen.getByTestId('expense-type');
      expect(expense_type).toBeTruthy();
      const expense_name = screen.getByTestId('expense-name');
      expect(expense_name).toBeTruthy();
      const datepicker = screen.getByTestId('datepicker');
      expect(datepicker).toBeTruthy();
      const amount = screen.getByTestId('amount');
      expect(amount).toBeTruthy();
      const vat = screen.getByTestId('vat');
      expect(vat).toBeTruthy();
      const pct = screen.getByTestId('pct');
      expect(pct).toBeTruthy();
      const commentary = screen.getByTestId('commentary');
      expect(commentary).toBeTruthy();
      const file = screen.getByTestId('file');
      expect(file).toBeTruthy();
      const btn_send_bill = screen.getByTestId('btn-send-bill');
      expect(btn_send_bill).toBeTruthy();
    });
  });

});


describe("Given I am connected as an employee, and I am on NewBill page", () => {
  describe('When I choose a file as image', () => {
    test('Then image will be selected', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: "Employee",
        email: "employee@test.tld"
      }));
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const fileNode = screen.getByTestId('file');
      fileNode.addEventListener('change', handleChangeFile);
      fireEvent.change(fileNode, {
        target: {
          files: [new File(['testData'], 'test.jpg', { type: 'image/jpg' })],
        }
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileNode.files[0].name).toBe('test.jpg');
    });
  });

  describe('When accomplis the form and I submit form', () => {
    test('Then the Bills page is rendered', async () => {
      document.body.html = '';
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: "Employee",
        email: "employee@test.tld"
      }));

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname, data: bills });
      };

      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const fileNode = screen.getByTestId('file');
      fireEvent.change(fileNode, {
        target: {
          files: [new File(['testData'], 'test.jpg', { type: 'image/jpg' })],
        }
      });
      const expense_name = screen.getByTestId('expense-name');
      const commentary = screen.getByTestId('commentary');
      const amount = screen.getByTestId('amount');
      const vat = screen.getByTestId('vat');
      const pct = screen.getByTestId('pct');
      const date = screen.getByTestId('datepicker');
      const expense_type = screen.getByTestId('expense-type');
      fireEvent.change(expense_name, { target: { value: 'test' } });
      fireEvent.change(commentary, { target: { value: 'just for test' } });
      fireEvent.change(amount, { target: { value: 200 } });
      fireEvent.change(vat, { target: { value: 20 } });
      fireEvent.change(pct, { target: { value: 10 } });
      fireEvent.change(date, { target: { value: '2020-05-12' } });
      fireEvent.change(expense_type, { target: { value: 'Transports' } });

      const form = screen.getByTestId('form-new-bill');
      const handleSubmit = jest.fn(() => newBill.handleSubmit);
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      await waitFor(() => screen.getAllByText('Mes notes de frais'));
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();

    });
  });

});

// Test d'intégration POST

describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBill page and I submit bill form", () => {
    test("Then the Bills page is rendered", async () => {
      document.body.html = '';
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      const updateSpy = jest.spyOn(mockStore, 'bills').mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.resolve({
              "id": "47qAXb6fIm2zOKkLzMro",
              "vat": "80",
              "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
              "status": "pending",
              "type": "Hôtel et logement",
              "commentary": "séminaire billed",
              "name": "encore",
              "fileName": "preview-facture-free-201801-pdf-1.jpg",
              "date": "2004-04-04",
              "amount": 400,
              "commentAdmin": "ok",
              "email": "a@a",
              "pct": 20
            });
          }
        };
      });

      const form = screen.getByTestId('form-new-bill');
      fireEvent.submit(form);
      expect(updateSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledTimes(1);
      const billsPage = screen.getAllByText('Mes notes de frais');
      expect(billsPage).toBeTruthy();

    });
  });
  describe("When I submit bill form and an error occurs on API", () => {
    test("Then I remain on newBill page", async () => {
      document.body.html = '';
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const updateSpy = jest.spyOn(mockStore, 'bills').mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 404'));
          }
        };
      });

      const form = screen.getByTestId('form-new-bill');
      fireEvent.submit(form);
      expect(updateSpy).toHaveBeenCalled();
      const billsPage = screen.getAllByText('Envoyer une note de frais');
      expect(billsPage).toBeTruthy();

    });
  });
});