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
    afterEach(() => {
      document.body.html = '';
    });
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
  describe('When I choose a file that is image with extension jpg, jpeg or png', () => {
    beforeEach(() => {
      document.body.html = '';
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Then the file name is logged', async () => {
      const logSpy = jest.spyOn(global.console, 'log');
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
      // change to file .jpg
      fireEvent.change(fileNode, {
        target: {
          files: [new File(['testData'], 'test.jpg', { type: 'image/jpg' })],
        }
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('test.jpg');
      // change to file .jpeg
      fireEvent.change(fileNode, {
        target: {
          files: [new File(['testData'], 'test.jpeg', { type: 'image/jpeg' })],
        }
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('test.jpeg');
      // change to file .png
      fireEvent.change(fileNode, {
        target: {
          files: [new File(['testData'], 'test.png', { type: 'image/png' })],
        }
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('test.png');
    });
  });

  describe('When I choose a file that is a pdf file', () => {
    beforeEach(() => {
      document.body.html = '';
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Then "Aucun fichier choisi" is logged', () => {
      const logSpy = jest.spyOn(global.console, 'log');
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
          files: [new File(['testData'], 'test.pdf', { type: 'application/pdf' })],
        }
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('Aucun fichier choisi');
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
  describe("When I am on NewBill page and I submit the bill form", () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test("Then the URL of the file is logged", async () => {
      const logSpy = jest.spyOn(global.console, 'log');
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
      const fileNode = screen.getByTestId('file');
      fireEvent.change(fileNode, {
        target: {
          files: [new File(['testData'], 'test.jpg', { type: 'image/jpg' })],
        }
      });
      await new Promise(process.nextTick);
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenCalledWith('https://localhost:3456/images/test.jpg');
    });
  });

  describe("When I submit bill form and an error occurs on API", () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      jest.spyOn(mockStore, 'bills');
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }));
      const root = document.createElement("div");
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test("Then log the 404 message error", async () => {
      const errorSpy = jest.spyOn(global.console, 'error');
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 404"));
          }
        };
      });
      window.onNavigate(ROUTES_PATH.NewBill);
      const fileNode = screen.getByTestId('file');
      fireEvent.change(fileNode, {
        target: {
          files: [new File(['testData'], 'test.jpg', { type: 'image/jpg' })],
        }
      });

      await new Promise(process.nextTick);
      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(new Error("Erreur 404"));
    });
    test("Then log the 500 message error", async () => {
      const errorSpy = jest.spyOn(global.console, 'error');
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 500"));
          }
        };
      });
      window.onNavigate(ROUTES_PATH.NewBill);
      const fileNode = screen.getByTestId('file');
      fireEvent.change(fileNode, {
        target: {
          files: [new File(['testData'], 'test.jpg', { type: 'image/jpg' })],
        }
      });

      await new Promise(process.nextTick);
      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(new Error("Erreur 500"));
    });
  });
});