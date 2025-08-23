const ErrorHandler = require('../utils/errorHandler');
const Inspection = require('../models/inspection.model');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle } = require('docx');
const { Packer } = require('docx');

// Create new inspection => /api/inspections
exports.createInspection = async (req, res, next) => {
  try {
    // Log the received data for debugging
    console.log('Received inspection data:', req.body);
    console.log('Received file:', req.file);
    
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    // If file was uploaded
    if (req.file) {
      req.body.file = req.file.path;
      req.body.fileUploadRequired = true;
    }

    // Ensure dates are properly formatted
    if (req.body.dateFrom) {
      req.body.dateFrom = new Date(req.body.dateFrom);
    }
    if (req.body.dateTo) {
      req.body.dateTo = new Date(req.body.dateTo);
    }

    // Validate required fields
    const requiredFields = [
      'inspectionType',
      'designationOfficer',
      'inspectingOfficer',
      'nameOfOfficer',
      'dateFrom',
      'dateTo',
      'inspectedOffice',
      'inspectedInstallation',
      'report'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return next(new ErrorHandler(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    // Create the inspection
    const inspection = await Inspection.create(req.body);

    res.status(201).json({
      success: true,
      inspection
    });
  } catch (error) {
    console.error('Error creating inspection:', error);
    next(error);
  }
};

// Get all inspections => /api/inspections
exports.getAllInspections = async (req, res, next) => {
  try {
    // Get inspections created by the logged-in user
    const inspections = await Inspection.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inspections.length,
      inspections
    });
  } catch (error) {
    next(error);
  }
};

// Get single inspection => /api/inspections/:id
exports.getInspectionDetails = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('createdBy', 'name designation');

    if (!inspection) {
      return next(new ErrorHandler('Inspection not found', 404));
    }

    res.status(200).json({
      success: true,
      inspection
    });
  } catch (error) {
    next(error);
  }
};

// Update inspection => /api/inspections/:id
exports.updateInspection = async (req, res, next) => {
  try {
    let inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return next(new ErrorHandler('Inspection not found', 404));
    }

    // Check if the user is the creator of the inspection
    if (inspection.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorHandler('You are not authorized to update this inspection', 403)
      );
    }

    // If file was uploaded
    if (req.file) {
      // Delete old file if exists
      if (inspection.file) {
        try {
          fs.unlinkSync(inspection.file);
        } catch (err) {
          console.error('Error deleting old file:', err);
        }
      }
      req.body.file = req.file.path;
      req.body.fileUploadRequired = true;
    }

    inspection = await Inspection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      inspection
    });
  } catch (error) {
    next(error);
  }
};

// Delete inspection => /api/inspections/:id
exports.deleteInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return next(new ErrorHandler('Inspection not found', 404));
    }

    // Check if the user is the creator of the inspection
    if (inspection.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorHandler('You are not authorized to delete this inspection', 403)
      );
    }

    // Delete file if exists
    if (inspection.file) {
      try {
        fs.unlinkSync(inspection.file);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await inspection.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Inspection deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Search inspections => /api/inspections/search
exports.searchInspections = async (req, res, next) => {
  try {
    console.log('Search request received:', req.body);
    
    const {
      inspectionType,
      installationType,
      inspectingOfficer,
      dateFrom,
      dateTo,
      format
    } = req.body;

    console.log('Format from request:', format);

    // Build query
    const query = {};

    if (inspectionType) {
      query.inspectionType = inspectionType;
    }

    if (installationType) {
      query.installationType = installationType;
    }

    if (inspectingOfficer) {
      query.inspectingOfficer = inspectingOfficer;
    }

    // Date range
    if (dateFrom && dateTo) {
      query.dateFrom = { $gte: new Date(dateFrom) };
      query.dateTo = { $lte: new Date(dateTo) };
    } else if (dateFrom) {
      query.dateFrom = { $gte: new Date(dateFrom) };
    } else if (dateTo) {
      query.dateTo = { $lte: new Date(dateTo) };
    }

    const inspections = await Inspection.find(query)
      .populate('createdBy', 'name designation')
      .sort({ dateFrom: -1 });

    console.log(`Found ${inspections.length} inspections`);

    // Format response based on requested format
    if (format && format !== 'json') {
      // Generate a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `inspection-report-${timestamp}`;
      
      // Create a download URL with the format and query parameters
      // Make sure format is explicitly included in the URL
      const downloadUrl = `/api/inspections/download?query=${encodeURIComponent(JSON.stringify(query))}`;
      
      console.log('Generated download URL:', downloadUrl);
      
      return res.status(200).json({
        success: true,
        count: inspections.length,
        format,
        downloadUrl,
        inspections
      });
    }
    
    // Default JSON response
    res.status(200).json({
      success: true,
      count: inspections.length,
      format: 'json',
      inspections
    });
  } catch (error) {
    console.error('Search error:', error);
    next(error);
  }
};

// Download inspection report => /api/inspections/download
exports.downloadInspectionReport = async (req, res, next) => {
  try {
    console.log('Download request received:');
    console.log('Query parameters:', req.query);
    console.log('Request URL:', req.originalUrl);
    
    const { format, query, token } = req.query;
    
    console.log('Format parameter:', format);
    console.log('Query parameter:', query);
    console.log('Token parameter:', token ? 'Present' : 'Not present');
    
    if (!format) {
      console.log('Format parameter is missing');
      return res.status(400).json({
        success: false,
        message: 'Format is required. Please specify format=PDF, format=Excel, or format=Word'
      });
    }
    
    // Parse the query if it exists
    let searchQuery = {};
    try {
      if (query) {
        searchQuery = JSON.parse(decodeURIComponent(query));
        console.log('Parsed search query:', searchQuery);
      } else {
        console.log('No query parameter provided, using empty search query');
      }
    } catch (error) {
      console.error('Error parsing query parameter:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameter format'
      });
    }
    
    // Fetch inspections based on the query
    const inspections = await Inspection.find(searchQuery)
      .populate('createdBy', 'name designation')
      .sort({ dateFrom: -1 });
    
    console.log(`Found ${inspections.length} inspections`);
    
    if (inspections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No inspections found matching the criteria'
      });
    }
    
    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `inspection-report-${timestamp}`;
    
    // Set appropriate headers based on format
    if (format.toLowerCase() === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
      
      // Create a PDF document
      const doc = new PDFDocument();
      doc.pipe(res);
      
      // Add title
      doc.fontSize(20).text('Inspection Report', { align: 'center' });
      doc.moveDown();
      
      // Add inspections
      inspections.forEach((insp, index) => {
        // Add a separator if not the first inspection
        if (index > 0) {
          doc.moveDown();
          doc.text('-------------------------------------------');
          doc.moveDown();
        }
        
        doc.fontSize(16).text(`Inspection ${index + 1}: ${insp.inspectionType}`);
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Officer: ${insp.inspectingOfficer} - ${insp.nameOfOfficer}`);
        doc.text(`Date: ${insp.dateFrom.toISOString().split('T')[0]} to ${insp.dateTo.toISOString().split('T')[0]}`);
        doc.text(`Installation: ${insp.inspectedInstallation}`);
        doc.moveDown(0.5);
        doc.text('Report:');
        doc.text(insp.report, { indent: 20 });
      });
      
      // Finalize the PDF
      doc.end();
      return;
    } 
    else if (format.toLowerCase() === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
      
      // Create a new Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inspection Report');
      
      // Add headers
      worksheet.columns = [
        { header: 'Inspection Type', key: 'type', width: 15 },
        { header: 'Officer', key: 'officer', width: 20 },
        { header: 'Date From', key: 'dateFrom', width: 15 },
        { header: 'Date To', key: 'dateTo', width: 15 },
        { header: 'Installation', key: 'installation', width: 30 },
        { header: 'Report', key: 'report', width: 50 }
      ];
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      
      // Add data
      inspections.forEach(insp => {
        worksheet.addRow({
          type: insp.inspectionType,
          officer: `${insp.inspectingOfficer} - ${insp.nameOfOfficer}`,
          dateFrom: insp.dateFrom.toISOString().split('T')[0],
          dateTo: insp.dateTo.toISOString().split('T')[0],
          installation: insp.inspectedInstallation,
          report: insp.report
        });
      });
      
      // Write to response
      await workbook.xlsx.write(res);
      res.end();
      return;
    } 
    else if (format.toLowerCase() === 'word') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.docx`);
      
      // Create a new Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: 'Inspection Report',
              heading: HeadingLevel.HEADING_1,
              alignment: 'center'
            })
          ]
        }]
      });
      
      // Add inspections
      inspections.forEach((insp, index) => {
        // Add a separator if not the first inspection
        if (index > 0) {
          doc.addSection({
            children: [
              new Paragraph({
                text: '-------------------------------------------',
                alignment: 'center'
              })
            ]
          });
        }
        
        // Add inspection details
        doc.addSection({
          children: [
            new Paragraph({
              text: `Inspection ${index + 1}: ${insp.inspectionType}`,
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: `Officer: ${insp.inspectingOfficer} - ${insp.nameOfOfficer}`
            }),
            new Paragraph({
              text: `Date: ${insp.dateFrom.toISOString().split('T')[0]} to ${insp.dateTo.toISOString().split('T')[0]}`
            }),
            new Paragraph({
              text: `Installation: ${insp.inspectedInstallation}`
            }),
            new Paragraph({
              text: 'Report:'
            }),
            new Paragraph({
              text: insp.report,
              indent: { left: 720 } // 720 twips = 0.5 inches
            })
          ]
        });
      });
      
      // Generate the document and write to response
      const buffer = await Packer.toBuffer(doc);
      res.write(buffer);
      res.end();
      return;
    } 
    else {
      return next(new ErrorHandler('Invalid format', 400));
    }
  } catch (error) {
    console.error('Error generating document:', error);
    next(error);
  }
};

// Get all inspections for all users => /api/inspections/all
exports.getAllUsersInspections = async (req, res, next) => {
  try {
    // Check if user is admin (optional security check)
    // if (req.user.role !== 'admin') {
    //   return next(new ErrorHandler('Not authorized to access all inspections', 403));
    // }

    // Get all inspections from all users
    const inspections = await Inspection.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name designation');

    res.status(200).json({
      success: true,
      count: inspections.length,
      inspections
    });
  } catch (error) {
    next(error);
  }
}; 