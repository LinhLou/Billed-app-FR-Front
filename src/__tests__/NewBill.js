/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { ROUTES } from "../constants/routes.js"
import mockStore from "../__mocks__/store.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the formular is shown", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const title = screen.getAllByText('Envoyer une note de frais')
      expect(title).toBeTruthy()
      const expense_type = screen.getByTestId('expense-type')
      expect(expense_type).toBeTruthy()
      const expense_name = screen.getByTestId('expense-name')
      expect(expense_name).toBeTruthy()
      const datepicker = screen.getByTestId('datepicker')
      expect(datepicker).toBeTruthy()
      const amount = screen.getByTestId('amount')
      expect(amount).toBeTruthy()
      const vat = screen.getByTestId('vat')
      expect(vat).toBeTruthy()
      const pct = screen.getByTestId('pct')
      expect(pct).toBeTruthy()
      const commentary = screen.getByTestId('commentary')
      expect(commentary).toBeTruthy()
      const file = screen.getByTestId('file')
      expect(file).toBeTruthy()
      const btn_send_bill = screen.getByTestId('btn-send-bill')
      expect(btn_send_bill).toBeTruthy()
    })
  })
  describe('When I am on NewBill page and I choose a file',()=>{
    test('Then only image will be selected, other type of file will not be accepted', ()=>{
      document.body.innerHTML=''
      Object.defineProperty(window,'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user',JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld"
      }))
      const onNavigate = (path_name)=>{
        document.body.innerHTML = ROUTES({path_name})
      }
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleChangeFile = jest.fn(()=>newBill.handleChangeFile)
      const fileNode = screen.getByTestId('file')
      fileNode.addEventListener('change',handleChangeFile)
      fireEvent.change(fileNode,{
        target: {
          files: [new File(['testData'], 'test.jpg', {type: 'image/jpg'})],
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileNode.files[0].name).toBe('test.jpg')

      fireEvent.change(fileNode,{
        target: {
          files: [new File(['testData'], 'test.pdf', {type: 'application/pdf'})]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileNode.files.length).toBe(0)
    })
  })
})
